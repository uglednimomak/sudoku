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

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get session ID from query or header
        let sessionId = req.headers['x-session-id'] || req.query.sessionId;
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        // Check if session exists
        const session = await db.get(
            'SELECT s.*, u.username, u.id as user_id FROM sessions s LEFT JOIN users u ON s.user_id = u.id WHERE s.session_id = $1 AND s.is_active = 1',
            [sessionId]
        );

        if (session) {
            // Update last active
            if (session.user_id) {
                await db.run('UPDATE users SET last_active = NOW() WHERE id = $1', [session.user_id]);
            }

            return res.json({
                sessionId: sessionId,
                hasUser: !!session.user_id,
                username: session.username || null,
                userId: session.user_id || null
            });
        } else {
            // Create new session
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            await db.run(
                'INSERT INTO sessions (session_id, expires_at) VALUES ($1, $2)',
                [sessionId, expiresAt.toISOString()]
            );

            return res.json({
                sessionId: sessionId,
                hasUser: false,
                username: null,
                userId: null
            });
        }
    } catch (error) {
        console.error('Session error:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
};
