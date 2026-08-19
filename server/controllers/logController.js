const { pool } = require('../config/db');

// Get all audit logs (Admin only)
exports.getAuditLogs = async (req, res) => {
  try {
    const [logs] = await pool.query(
      `SELECT al.*, u.name as user_name, u.email as user_email, u.role as user_role 
       FROM audit_logs al 
       LEFT JOIN users u ON al.user_id = u.id 
       ORDER BY al.created_at DESC 
       LIMIT 100`
    );
    res.status(200).json({ logs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
