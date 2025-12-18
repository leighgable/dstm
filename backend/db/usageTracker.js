const pool = require('./db');
const MAX_GENERATIONS_PER_DAY = 1; // Your chosen limit

// Helper function to check if the user is over the daily limit
async function checkUsage(sessionId) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    let conn;
    try {
        conn = await pool.getConnection();
        const res = await conn.query(
            `SELECT generations_count, last_reset_date 
             FROM usage_tracking 
             WHERE session_id = ?`, 
             [sessionId]
        );

        if (res.length > 0) {
            const { generations_count, last_reset_date } = res[0];
            
            // If the last reset date is before today, we treat them as a new day
            if (last_reset_date < today) {
                // We'll reset their count when they generate the first prompt
                return true; 
            }
            
            // Check the limit
            if (generations_count >= MAX_GENERATIONS_PER_DAY) {
                return false; // Limit exceeded
            }
        }
        return true; // OK to proceed or new session
    } catch (err) {
        console.error("DB Check Error:", err);
        return false; // Fail safe: deny request on database error
    } finally {
        if (conn) conn.release();
    }
}

// Helper function to update the usage after a successful generation
async function recordUsage(sessionId) {
    const today = new Date().toISOString().split('T')[0];
    let conn;
    try {
        conn = await pool.getConnection();
        
        // Use a single query to insert or update the record
        // This handles resetting the count if the last_reset_date is old
        await conn.query(
            `INSERT INTO usage_tracking (session_id, generations_count, last_reset_date)
             VALUES (?, 1, ?)
             ON DUPLICATE KEY UPDATE 
                generations_count = IF(last_reset_date < ?, 1, generations_count + 1),
                last_reset_date = ?`,
             [sessionId, today, today, today]
        );
        return true;
    } catch (err) {
        console.error("DB Record Error:", err);
        return false;
    } finally {
        if (conn) conn.release();
    }
}

module.exports = { checkUsage, recordUsage };

/* * NOTE: must create the 'usage_tracking' table in your MariaDB instance:
 * * CREATE TABLE usage_tracking (
 * session_id VARCHAR(255) PRIMARY KEY,
 * generations_count INT DEFAULT 0,
 * last_reset_date DATE
 * );
 */
