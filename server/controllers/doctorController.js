const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { logAction } = require('../services/auditService');

// Create Doctor (Admin only)
exports.createDoctor = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { email, password, name, specialization, department, contact, availability } = req.body;

    if (!email || !password || !name || !specialization || !department) {
      return res.status(400).json({ message: 'Email, password, name, specialization, and department are required' });
    }

    // Start Transaction
    await connection.beginTransaction();

    // 1. Create User
    const passwordHash = await bcrypt.hash(password, 10);
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, "doctor")',
      [name, email, passwordHash]
    );

    const userId = userResult.insertId;

    // 2. Create Doctor Profile
    const [doctorResult] = await connection.query(
      'INSERT INTO doctors (user_id, name, specialization, department, contact, availability) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name, specialization, department, contact || null, availability || null]
    );

    const doctorId = doctorResult.insertId;

    // Commit Transaction
    await connection.commit();

    await logAction(req.user.id, 'CREATE_DOCTOR', 'doctors', doctorId, `Created doctor profile and login for Dr. ${name}`);

    res.status(201).json({
      message: 'Doctor created successfully',
      doctorId,
      userId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create doctor error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email address already registered' });
    }
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

// Get All Doctors (Admin, Staff, Doctor)
exports.getAllDoctors = async (req, res) => {
  try {
    const [doctors] = await pool.query('SELECT * FROM doctors');
    res.status(200).json({ doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Doctor by ID (Admin, Staff, Doctor)
exports.getDoctorById = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const [doctors] = await pool.query('SELECT * FROM doctors WHERE id = ?', [doctorId]);

    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.status(200).json({ doctor: doctors[0] });
  } catch (error) {
    console.error('Get doctor details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Doctor (Admin only)
exports.updateDoctor = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const doctorId = req.params.id;
    const { name, specialization, department, contact, availability } = req.body;

    const [doctors] = await pool.query('SELECT * FROM doctors WHERE id = ?', [doctorId]);
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const doctor = doctors[0];

    await connection.beginTransaction();

    // Update Doctors Profile
    await connection.query(
      'UPDATE doctors SET name = ?, specialization = ?, department = ?, contact = ?, availability = ? WHERE id = ?',
      [name, specialization, department, contact || null, availability || null, doctorId]
    );

    // Update name in Users table if it changed
    if (doctor.user_id) {
      await connection.query('UPDATE users SET name = ? WHERE id = ?', [name, doctor.user_id]);
    }

    await connection.commit();

    await logAction(req.user.id, 'UPDATE_DOCTOR', 'doctors', doctorId, `Updated doctor profile for Dr. ${name}`);

    res.status(200).json({ message: 'Doctor updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Update doctor error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

// Delete Doctor (Admin only)
exports.deleteDoctor = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const doctorId = req.params.id;

    const [doctors] = await pool.query('SELECT * FROM doctors WHERE id = ?', [doctorId]);
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const doctor = doctors[0];

    await connection.beginTransaction();

    // Delete doctor profile
    await connection.query('DELETE FROM doctors WHERE id = ?', [doctorId]);

    // Delete linked user login if exists
    if (doctor.user_id) {
      await connection.query('DELETE FROM users WHERE id = ?', [doctor.user_id]);
    }

    await connection.commit();

    await logAction(req.user.id, 'DELETE_DOCTOR', 'doctors', doctorId, `Deleted doctor profile for Dr. ${doctor.name}`);

    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Delete doctor error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};
