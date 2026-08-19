const { pool } = require('../config/db');

async function logAction(userId, action, entityType, entityId, details) {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [userId || null, action, entityType || null, entityId || null, details || null]
    );
  } catch (error) {
    console.error('Error logging audit action:', error.message);
  }
}

module.exports = { logAction };
