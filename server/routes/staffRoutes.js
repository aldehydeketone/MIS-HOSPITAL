const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Get all staff (Admin, Staff)
router.get('/', protect, authorizeRoles('admin', 'staff'), staffController.getAllStaff);

// Create staff profile and user account (Admin only)
router.post('/', protect, authorizeRoles('admin'), staffController.createStaff);

// Get specific staff details (Admin, Staff)
router.get('/:id', protect, authorizeRoles('admin', 'staff'), staffController.getStaffById);

// Update staff profile (Admin only)
router.put('/:id', protect, authorizeRoles('admin'), staffController.updateStaff);

// Delete staff profile (Admin only)
router.delete('/:id', protect, authorizeRoles('admin'), staffController.deleteStaff);

module.exports = router;
