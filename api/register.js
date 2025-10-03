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

    const { username } = req.body;
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    
    if (!username || username.trim().length === 0) {
        return res.status(400).json({ error: 'Username is required' });
    }
    
    if (username.length > 50) {
        return res.status(400).json({ error: 'Username must be 50 characters or less' });
    }

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
    }

    const db = getDatabase();
    
    // Check if username already exists
    db.get('SELECT id FROM users WHERE username = ?', [username.trim()], (err, row) => {
        if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (row) {
            db.close();
            return res.status(409).json({ error: 'Username already taken' });
        }
        
        // Create new user
        db.run(
            'INSERT INTO users (username, session_id) VALUES (?, ?)',
            [username.trim(), sessionId],
            function(err) {
                if (err) {
                    db.close();
                    return res.status(500).json({ error: 'Failed to create user' });
                }
                
                const userId = this.lastID;
                
                // Update session with user_id
                db.run(
                    'UPDATE sessions SET user_id = ? WHERE session_id = ?',
                    [userId, sessionId],
                    (err) => {
                        db.close();
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
}
