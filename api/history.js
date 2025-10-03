const db = require('../lib/db');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Session-ID, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const sessionId = req.headers['x-session-id'] || req.query.sessionId;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const user = await db.get(
            'SELECT u.id FROM users u JOIN sessions s ON u.id = s.user_id WHERE s.session_id = $1 AND s.is_active = 1',
            [sessionId]
        );

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const games = await db.all(
            'SELECT * FROM games WHERE user_id = $1 ORDER BY completed_at DESC LIMIT 100',
            [user.id]
        );

        return res.json({ games });
    } catch (error) {
        console.error('History error:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
};
