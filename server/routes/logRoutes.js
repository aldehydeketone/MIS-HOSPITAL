const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Get audit logs (Admin only)
router.get('/', protect, authorizeRoles('admin'), logController.getAuditLogs);

module.exports = router;
