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

    const { type = 'fastest', limit = 10 } = req.query;
    
    let query;
    if (type === 'fastest') {
        query = 'SELECT * FROM fastest_times_global WHERE global_rank <= ? ORDER BY completion_time ASC';
    } else if (type === 'highest') {
        query = 'SELECT * FROM highest_scores_global WHERE global_rank <= ? ORDER BY score DESC';
    } else {
        return res.status(400).json({ error: 'Invalid leaderboard type' });
    }

    const db = getDatabase();
    
    db.all(query, [parseInt(limit)], (err, rows) => {
        db.close();
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch leaderboards' });
        }
        
        res.json({ leaderboard: rows });
    });
}
