// Database abstraction layer
// Uses Vercel Postgres for production, SQLite for local development

const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';

let db;

if (isProduction && process.env.POSTGRES_URL) {
    // Use Vercel Postgres in production
    const { Pool } = require('pg');
    
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    db = {
        async query(text, params) {
            const client = await pool.connect();
            try {
                const result = await client.query(text, params);
                return result.rows;
            } finally {
                client.release();
            }
        },
        
        async get(text, params) {
            const rows = await this.query(text, params);
            return rows[0] || null;
        },
        
        async run(text, params) {
            const client = await pool.connect();
            try {
                const result = await client.query(text, params);
                return { lastID: result.rows[0]?.id, changes: result.rowCount };
            } finally {
                client.release();
            }
        },
        
        async all(text, params) {
            return await this.query(text, params);
        }
    };
} else {
    // Use SQLite for local development
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const dbPath = path.join(process.cwd(), 'database', 'metal_sudoku.db');
    
    const sqliteDb = new sqlite3.Database(dbPath);
    
    db = {
        query(text, params = []) {
            return new Promise((resolve, reject) => {
                sqliteDb.all(text, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        },
        
        get(text, params = []) {
            return new Promise((resolve, reject) => {
                sqliteDb.get(text, params, (err, row) => {
                    if (err) reject(err);
                    else resolve(row || null);
                });
            });
        },
        
        run(text, params = []) {
            return new Promise((resolve, reject) => {
                sqliteDb.run(text, params, function(err) {
                    if (err) reject(err);
                    else resolve({ lastID: this.lastID, changes: this.changes });
                });
            });
        },
        
        all(text, params = []) {
            return this.query(text, params);
        }
    };
}

module.exports = db;
