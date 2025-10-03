const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Import API routes
const sessionHandler = require('./api/session');
const registerHandler = require('./api/register');
const gameHandler = require('./api/game');
const historyHandler = require('./api/history');
const leaderboardsHandler = require('./api/leaderboards');

// API routes
app.get('/api/session', sessionHandler);
app.post('/api/register', registerHandler);
app.post('/api/game', gameHandler);
app.get('/api/history', historyHandler);
app.get('/api/leaderboards', leaderboardsHandler);

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🎸 Metal Sudoku server running on port ${PORT}`);
    console.log(`🌐 Game available at: http://localhost:${PORT}`);
});
