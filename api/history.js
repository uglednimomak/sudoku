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

    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    
    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
    }

    const db = getDatabase();
    
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
            
            db.all(
                'SELECT * FROM games WHERE user_id = ? ORDER BY completed_at DESC LIMIT 100',
                [row.id],
                (err, games) => {
                    db.close();
                    if (err) {
                        return res.status(500).json({ error: 'Failed to fetch history' });
                    }
                    
                    res.json({ games });
                }
            );
        }
    );
}
