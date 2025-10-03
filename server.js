const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const dbPath = path.join(__dirname, 'database', 'metal_sudoku.db');
let db;

function initializeDatabase() {
    if (!db) {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                // Don't exit in serverless environment
                if (process.env.NODE_ENV !== 'production') {
                    process.exit(1);
                }
            } else {
                console.log('Connected to SQLite database.');
            }
        });
    }
    return db;
}

// Initialize database
db = initializeDatabase();

// Middleware
app.use(helmet({
    contentSecurityPolicy: false // Allow inline scripts for development
}));
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.static('.', {
    index: 'index.html'
}));

// Session configuration
app.use(session({
    secret: 'metal-sudoku-secret-key-' + Math.random(),
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
}));

// Helper function to clean expired sessions
function cleanExpiredSessions() {
    db.run('UPDATE sessions SET is_active = 0 WHERE expires_at < datetime("now")', (err) => {
        if (err) console.error('Error cleaning expired sessions:', err);
    });
}

// Clean expired sessions every hour
setInterval(cleanExpiredSessions, 60 * 60 * 1000);

// API Routes

// Check if user exists and get/create session
app.get('/api/session', (req, res) => {
    const sessionId = req.session.id;
    
    // Check if session exists in database
    db.get(
        'SELECT s.*, u.username, u.id as user_id FROM sessions s LEFT JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.is_active = 1',
        [sessionId],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (row) {
                // Update last active
                if (row.user_id) {
                    db.run('UPDATE users SET last_active = datetime("now") WHERE id = ?', [row.user_id]);
                }
                
                res.json({
                    sessionId: sessionId,
                    hasUser: !!row.user_id,
                    username: row.username || null,
                    userId: row.user_id || null
                });
            } else {
                // Create new session
                const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
                
                db.run(
                    'INSERT INTO sessions (session_id, expires_at) VALUES (?, ?)',
                    [sessionId, expiresAt.toISOString()],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ error: 'Failed to create session' });
                        }
                        
                        res.json({
                            sessionId: sessionId,
                            hasUser: false,
                            username: null,
                            userId: null
                        });
                    }
                );
            }
        }
    );
});

// Register new user
app.post('/api/register', (req, res) => {
    const { username } = req.body;
    const sessionId = req.session.id;
    
    if (!username || username.trim().length === 0) {
        return res.status(400).json({ error: 'Username is required' });
    }
    
    if (username.length > 50) {
        return res.status(400).json({ error: 'Username must be 50 characters or less' });
    }
    
    // Check if username already exists
    db.get('SELECT id FROM users WHERE username = ?', [username.trim()], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (row) {
            return res.status(409).json({ error: 'Username already taken' });
        }
        
        // Create new user
        db.run(
            'INSERT INTO users (username, session_id) VALUES (?, ?)',
            [username.trim(), sessionId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to create user' });
                }
                
                const userId = this.lastID;
                
                // Update session with user_id
                db.run(
                    'UPDATE sessions SET user_id = ? WHERE session_id = ?',
                    [userId, sessionId],
                    (err) => {
                        if (err) {
                            console.error('Failed to update session:', err);
                        }
                        
                        res.json({
                            success: true,
                            userId: userId,
                            username: username.trim(),
                            sessionId: sessionId
                        });
                    }
                );
            }
        );
    });
});

// Save completed game
app.post('/api/game', (req, res) => {
    const { difficulty, difficultyName, completionTime, score } = req.body;
    const sessionId = req.session.id;

    if (!difficulty || !difficultyName || !completionTime || !score) {
        return res.status(400).json({ error: 'Missing required game data' });
    }

    // Get user from session
    db.get(
        'SELECT u.id FROM users u JOIN sessions s ON u.id = s.user_id WHERE s.session_id = ? AND s.is_active = 1',
        [sessionId],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!row) {
                return res.status(401).json({ error: 'User not found' });
            }

            const userId = row.id;

            // Save game
            db.run(
                'INSERT INTO games (user_id, difficulty, difficulty_name, completion_time, score) VALUES (?, ?, ?, ?, ?)',
                [userId, difficulty, difficultyName, completionTime, score],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to save game' });
                    }

                    // Update user statistics
                    db.run(`
                        UPDATE users SET
                            total_games = total_games + 1,
                            total_time = total_time + ?,
                            best_time = CASE
                                WHEN best_time IS NULL OR ? < best_time THEN ?
                                ELSE best_time
                            END,
                            highest_score = CASE
                                WHEN ? > highest_score THEN ?
                                ELSE highest_score
                            END,
                            last_active = datetime("now")
                        WHERE id = ?
                    `, [completionTime, completionTime, completionTime, score, score, userId], (err) => {
                        if (err) {
                            console.error('Failed to update user stats:', err);
                        }

                        res.json({
                            success: true,
                            gameId: this.lastID
                        });
                    });
                }
            );
        }
    );
});

// Get user's game history
app.get('/api/history', (req, res) => {
    const sessionId = req.session.id;

    db.get(
        'SELECT u.id FROM users u JOIN sessions s ON u.id = s.user_id WHERE s.session_id = ? AND s.is_active = 1',
        [sessionId],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!row) {
                return res.status(401).json({ error: 'User not found' });
            }

            db.all(
                'SELECT * FROM games WHERE user_id = ? ORDER BY completed_at DESC LIMIT 100',
                [row.id],
                (err, games) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to fetch history' });
                    }

                    res.json({ games });
                }
            );
        }
    );
});

// Get global leaderboards
app.get('/api/leaderboards', (req, res) => {
    const { type = 'fastest', limit = 10 } = req.query;

    let query;
    if (type === 'fastest') {
        query = 'SELECT * FROM fastest_times_global WHERE global_rank <= ? ORDER BY completion_time ASC';
    } else if (type === 'highest') {
        query = 'SELECT * FROM highest_scores_global WHERE global_rank <= ? ORDER BY score DESC';
    } else {
        return res.status(400).json({ error: 'Invalid leaderboard type' });
    }

    db.all(query, [parseInt(limit)], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch leaderboards' });
        }

        res.json({ leaderboard: rows });
    });
});

// Get user statistics
app.get('/api/user/stats', (req, res) => {
    const sessionId = req.session.id;

    db.get(
        'SELECT * FROM user_stats WHERE id = (SELECT u.id FROM users u JOIN sessions s ON u.id = s.user_id WHERE s.session_id = ? AND s.is_active = 1)',
        [sessionId],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!row) {
                return res.status(401).json({ error: 'User not found' });
            }

            res.json({ stats: row });
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`Metal Sudoku server running on port ${PORT}`);
    console.log(`Game available at: http://localhost:${PORT}`);

    // Clean expired sessions on startup
    cleanExpiredSessions();
});
