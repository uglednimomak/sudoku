-- Metal Sudoku Database Schema

-- Users table to store player information
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_games INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0,
    best_time INTEGER DEFAULT NULL,
    highest_score INTEGER DEFAULT 0
);

-- Games table to store individual game records
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    difficulty INTEGER NOT NULL,
    difficulty_name VARCHAR(20) NOT NULL,
    completion_time INTEGER NOT NULL,
    score INTEGER NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessions table to track active sessions
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_session_id ON users(session_id);
CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_difficulty ON games(difficulty);
CREATE INDEX IF NOT EXISTS idx_games_score ON games(score DESC);
CREATE INDEX IF NOT EXISTS idx_games_time ON games(completion_time ASC);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active);

-- Views for leaderboards
CREATE VIEW IF NOT EXISTS fastest_times_global AS
SELECT 
    u.username,
    g.difficulty,
    g.difficulty_name,
    g.completion_time,
    g.score,
    g.completed_at,
    ROW_NUMBER() OVER (PARTITION BY g.difficulty ORDER BY g.completion_time ASC) as rank_in_difficulty,
    ROW_NUMBER() OVER (ORDER BY g.completion_time ASC) as global_rank
FROM games g
JOIN users u ON g.user_id = u.id
ORDER BY g.completion_time ASC;

CREATE VIEW IF NOT EXISTS highest_scores_global AS
SELECT 
    u.username,
    g.difficulty,
    g.difficulty_name,
    g.completion_time,
    g.score,
    g.completed_at,
    ROW_NUMBER() OVER (PARTITION BY g.difficulty ORDER BY g.score DESC) as rank_in_difficulty,
    ROW_NUMBER() OVER (ORDER BY g.score DESC) as global_rank
FROM games g
JOIN users u ON g.user_id = u.id
ORDER BY g.score DESC;

-- User statistics view
CREATE VIEW IF NOT EXISTS user_stats AS
SELECT 
    u.id,
    u.username,
    u.total_games,
    u.total_time,
    u.best_time,
    u.highest_score,
    u.created_at,
    u.last_active,
    ROUND(AVG(g.completion_time), 2) as avg_completion_time,
    ROUND(AVG(g.score), 2) as avg_score,
    COUNT(DISTINCT g.difficulty) as difficulties_played
FROM users u
LEFT JOIN games g ON u.id = g.user_id
GROUP BY u.id, u.username, u.total_games, u.total_time, u.best_time, u.highest_score, u.created_at, u.last_active;
