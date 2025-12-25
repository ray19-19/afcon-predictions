import { sql } from '@vercel/postgres';

export const db = sql;

// Helper function to initialize database tables
export async function initDatabase() {
    try {
        // Create users table
        await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

        // Create matches table
        await sql`
      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        home_team VARCHAR(100) NOT NULL,
        away_team VARCHAR(100) NOT NULL,
        competition VARCHAR(100) DEFAULT 'AFCON 2025',
        venue VARCHAR(200),
        match_date DATE NOT NULL,
        kickoff_time TIMESTAMP NOT NULL,
        home_score INTEGER,
        away_score INTEGER,
        status VARCHAR(20) DEFAULT 'SCHEDULED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

        // Create predictions table
        await sql`
      CREATE TABLE IF NOT EXISTS predictions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
        predicted_home_score INTEGER NOT NULL,
        predicted_away_score INTEGER NOT NULL,
        points INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, match_id)
      )
    `;

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_predictions_match ON predictions(match_id)`;

        console.log('Database tables initialized successfully');
        return { success: true };
    } catch (error) {
        console.error('Database initialization error:', error);
        return { success: false, error };
    }
}
