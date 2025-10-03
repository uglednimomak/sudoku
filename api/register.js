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

        // Check if username already exists
        const existing = await db.get('SELECT id FROM users WHERE username = $1', [username.trim()]);

        if (existing) {
            return res.status(409).json({ error: 'Username already taken' });
        }

        // Create new user
        const result = await db.run(
            'INSERT INTO users (username, session_id) VALUES ($1, $2) RETURNING id',
            [username.trim(), sessionId]
        );

        const userId = result.lastID;

        // Update session with user_id
        await db.run(
            'UPDATE sessions SET user_id = $1 WHERE session_id = $2',
            [userId, sessionId]
        );

        return res.json({
            success: true,
            userId: userId,
            username: username.trim(),
            sessionId: sessionId
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
};
