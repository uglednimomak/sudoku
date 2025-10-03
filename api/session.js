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

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const db = getDatabase();
    
    // Generate a simple session ID if not exists
    let sessionId = req.headers['x-session-id'] || req.query.sessionId;
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Check if session exists in database
    db.get(
        'SELECT s.*, u.username, u.id as user_id FROM sessions s LEFT JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.is_active = 1',
        [sessionId],
        (err, row) => {
            if (err) {
                db.close();
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (row) {
                // Update last active
                if (row.user_id) {
                    db.run('UPDATE users SET last_active = datetime("now") WHERE id = ?', [row.user_id]);
                }
                
                db.close();
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
                        db.close();
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
}
