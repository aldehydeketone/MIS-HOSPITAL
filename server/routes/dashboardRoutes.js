const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Get dashboard stats (Accessible by admin, doctor, staff - returns role-specific content)
router.get('/', protect, dashboardController.getDashboardStats);

module.exports = router;
