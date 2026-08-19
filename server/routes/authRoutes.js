const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Login route (Public)
router.post('/login', authController.login);

// Me route (Protected - will require authMiddleware)
router.get('/me', protect, authController.getMe);

module.exports = router;
