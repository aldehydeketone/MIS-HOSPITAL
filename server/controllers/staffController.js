const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { logAction } = require('../services/auditService');

// Create Staff (Admin only)
exports.createStaff = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { email, password, name, department, contact } = req.body;

    if (!email || !password || !name || !department) {
      return res.status(400).json({ message: 'Email, password, name, and department are required' });
    }

    // Start Transaction
    await connection.beginTransaction();

    // 1. Create User
    const passwordHash = await bcrypt.hash(password, 10);
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, "staff")',
      [name, email, passwordHash]
    );

    const userId = userResult.insertId;

    // 2. Create Staff Profile
    const [staffResult] = await connection.query(
      'INSERT INTO staff (user_id, name, department, contact) VALUES (?, ?, ?, ?)',
      [userId, name, department, contact || null]
    );

    const staffId = staffResult.insertId;

    // Commit Transaction
    await connection.commit();

    await logAction(req.user.id, 'CREATE_STAFF', 'staff', staffId, `Created staff profile and login for ${name}`);

    res.status(201).json({
      message: 'Staff created successfully',
      staffId,
      userId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create staff error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email address already registered' });
    }
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

// Get All Staff (Admin, Staff)
exports.getAllStaff = async (req, res) => {
  try {
    const [staff] = await pool.query('SELECT * FROM staff');
    res.status(200).json({ staff });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Staff by ID (Admin, Staff)
exports.getStaffById = async (req, res) => {
  try {
    const staffId = req.params.id;
    const [staff] = await pool.query('SELECT * FROM staff WHERE id = ?', [staffId]);

    if (staff.length === 0) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.status(200).json({ staff: staff[0] });
  } catch (error) {
    console.error('Get staff details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Staff (Admin only)
exports.updateStaff = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const staffId = req.params.id;
    const { name, department, contact } = req.body;

    const [staffList] = await pool.query('SELECT * FROM staff WHERE id = ?', [staffId]);
    if (staffList.length === 0) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const staff = staffList[0];

    await connection.beginTransaction();

    // Update Staff Profile
    await connection.query(
      'UPDATE staff SET name = ?, department = ?, contact = ? WHERE id = ?',
      [name, department, contact || null, staffId]
    );

    // Update name in Users table if it changed
    if (staff.user_id) {
      await connection.query('UPDATE users SET name = ? WHERE id = ?', [name, staff.user_id]);
    }

    await connection.commit();

    await logAction(req.user.id, 'UPDATE_STAFF', 'staff', staffId, `Updated staff profile for ${name}`);

    res.status(200).json({ message: 'Staff updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Update staff error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

// Delete Staff (Admin only)
exports.deleteStaff = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const staffId = req.params.id;

    const [staffList] = await pool.query('SELECT * FROM staff WHERE id = ?', [staffId]);
    if (staffList.length === 0) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const staff = staffList[0];

    await connection.beginTransaction();

    // Delete staff profile
    await connection.query('DELETE FROM staff WHERE id = ?', [staffId]);

    // Delete linked user login if exists
    if (staff.user_id) {
      await connection.query('DELETE FROM users WHERE id = ?', [staff.user_id]);
    }

    await connection.commit();

    await logAction(req.user.id, 'DELETE_STAFF', 'staff', staffId, `Deleted staff profile for ${staff.name}`);

    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Delete staff error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};
