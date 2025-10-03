-- PostgreSQL Schema for Metal Sudoku
-- Run this in your Vercel Postgres database

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    session_id VARCHAR(255),
    total_games INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0,
    best_time INTEGER,
    highest_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    difficulty INTEGER NOT NULL,
    difficulty_name VARCHAR(20) NOT NULL,
    completion_time INTEGER NOT NULL,
    score INTEGER NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_completed_at ON games(completed_at);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- View for fastest times global leaderboard
CREATE OR REPLACE VIEW fastest_times_global AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY g.completion_time ASC) as global_rank,
    u.username,
    g.difficulty_name,
    g.completion_time,
    g.score,
    g.completed_at
FROM games g
JOIN users u ON g.user_id = u.id
WHERE g.id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, difficulty ORDER BY completion_time ASC) as rn
        FROM games
    ) ranked
    WHERE rn = 1
)
ORDER BY g.completion_time ASC;

-- View for highest scores global leaderboard
CREATE OR REPLACE VIEW highest_scores_global AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY g.score DESC) as global_rank,
    u.username,
    g.difficulty_name,
    g.completion_time,
    g.score,
    g.completed_at
FROM games g
JOIN users u ON g.user_id = u.id
ORDER BY g.score DESC
LIMIT 100;

-- View for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.total_games,
    u.total_time,
    u.best_time,
    u.highest_score,
    COUNT(DISTINCT g.difficulty) as difficulties_played,
    u.created_at,
    u.last_active
FROM users u
LEFT JOIN games g ON u.id = g.user_id
GROUP BY u.id, u.username, u.total_games, u.total_time, u.best_time, u.highest_score, u.created_at, u.last_active;
