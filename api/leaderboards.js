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
        const { type = 'fastest', limit = 10 } = req.query;

        let query;
        if (type === 'fastest') {
            query = 'SELECT * FROM fastest_times_global WHERE global_rank <= $1 ORDER BY completion_time ASC';
        } else if (type === 'highest') {
            query = 'SELECT * FROM highest_scores_global WHERE global_rank <= $1 ORDER BY score DESC';
        } else {
            return res.status(400).json({ error: 'Invalid leaderboard type' });
        }

        const leaderboard = await db.all(query, [parseInt(limit)]);

        return res.json({ leaderboard });
    } catch (error) {
        console.error('Leaderboard error:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
};
