// Explicitly load environment variables from .env file in the backend directory
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const mariadb = require('mariadb');

// Create a connection pool using environment variables.
// The server will use these details to connect to your database.
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5
});

/**
 * Creates the 'usage_tracking' table if it doesn't already exist.
 * This function is called when the server starts.
 */
async function initializeDatabase() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log("Connected to the database.");

        const query = `
            CREATE TABLE IF NOT EXISTS usage_tracking (
                session_id VARCHAR(255) PRIMARY KEY,
                generations_count INT DEFAULT 0,
                last_reset_date DATE
            );
        `;

        await conn.query(query);
        console.log("Database initialized: 'usage_tracking' table is ready.");

    } catch (err) {
        console.error("Error initializing database:", err);
        // If the app can't connect to the DB, it should probably exit.
        process.exit(1);
    } finally {
        // Ensure the connection is always released back to the pool
        if (conn) {
            conn.release();
            console.log("Database connection released.");
        }
    }
}

module.exports = { pool, initializeDatabase };