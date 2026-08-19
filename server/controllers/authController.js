const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Query user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Determine role details
    let profileId = null;
    if (user.role === 'doctor') {
      const [doctors] = await pool.query('SELECT id FROM doctors WHERE user_id = ?', [user.id]);
      if (doctors.length > 0) {
        profileId = doctors[0].id;
      }
    } else if (user.role === 'staff') {
      const [staff] = await pool.query('SELECT id FROM staff WHERE user_id = ?', [user.id]);
      if (staff.length > 0) {
        profileId = staff[0].id;
      }
    }

    // Sign token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        profileId: profileId
      },
      process.env.JWT_SECRET || 'supersecretjwtkeyforhospitalmis123',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileId
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    // req.user will be populated by authMiddleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.status(200).json({ user: req.user });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
