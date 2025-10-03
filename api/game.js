const db = require('../lib/db');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Session-ID, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { difficulty, difficultyName, completionTime, score } = req.body;
        const sessionId = req.headers['x-session-id'] || req.query.sessionId;

        if (!difficulty || !difficultyName || !completionTime || !score) {
            return res.status(400).json({ error: 'Missing required game data' });
        }

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        // Get user from session
        const user = await db.get(
            'SELECT u.id FROM users u JOIN sessions s ON u.id = s.user_id WHERE s.session_id = $1 AND s.is_active = 1',
            [sessionId]
        );

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const userId = user.id;

        // Save game
        const result = await db.run(
            'INSERT INTO games (user_id, difficulty, difficulty_name, completion_time, score) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [userId, difficulty, difficultyName, completionTime, score]
        );

        const gameId = result.lastID;

        // Update user statistics
        await db.run(`
            UPDATE users SET 
                total_games = total_games + 1,
                total_time = total_time + $1,
                best_time = CASE 
                    WHEN best_time IS NULL OR $2 < best_time THEN $3 
                    ELSE best_time 
                END,
                highest_score = CASE 
                    WHEN $4 > highest_score THEN $5 
                    ELSE highest_score 
                END,
                last_active = NOW()
            WHERE id = $6
        `, [completionTime, completionTime, completionTime, score, score, userId]);

        return res.json({
            success: true,
            gameId: gameId
        });
    } catch (error) {
        console.error('Game save error:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
};
