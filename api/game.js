const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database setup
const dbPath = path.join(process.cwd(), 'database', 'metal_sudoku.db');

function getDatabase() {
    return new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        }
    });
}

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { difficulty, difficultyName, completionTime, score } = req.body;
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    
    if (!difficulty || !difficultyName || !completionTime || !score) {
        return res.status(400).json({ error: 'Missing required game data' });
    }

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
    }

    const db = getDatabase();
    
    // Get user from session
    db.get(
        'SELECT u.id FROM users u JOIN sessions s ON u.id = s.user_id WHERE s.session_id = ? AND s.is_active = 1',
        [sessionId],
        (err, row) => {
            if (err) {
                db.close();
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (!row) {
                db.close();
                return res.status(401).json({ error: 'User not found' });
            }
            
            const userId = row.id;
            
            // Save game
            db.run(
                'INSERT INTO games (user_id, difficulty, difficulty_name, completion_time, score) VALUES (?, ?, ?, ?, ?)',
                [userId, difficulty, difficultyName, completionTime, score],
                function(err) {
                    if (err) {
                        db.close();
                        return res.status(500).json({ error: 'Failed to save game' });
                    }
                    
                    const gameId = this.lastID;
                    
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
                        db.close();
                        if (err) {
                            console.error('Failed to update user stats:', err);
                        }
                        
                        res.json({
                            success: true,
                            gameId: gameId
                        });
                    });
                }
            );
        }
    );
}
