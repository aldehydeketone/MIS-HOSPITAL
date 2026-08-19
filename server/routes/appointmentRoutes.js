const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Get all appointments (Admin, Staff see all; Doctor sees own)
router.get('/', protect, authorizeRoles('admin', 'staff', 'doctor'), appointmentController.getAllAppointments);

// Create appointment (Admin, Staff only)
router.post('/', protect, authorizeRoles('admin', 'staff'), appointmentController.createAppointment);

// Update appointment or update status (Admin, Staff can update everything; Doctor can update status only)
router.put('/:id', protect, authorizeRoles('admin', 'staff', 'doctor'), appointmentController.updateAppointment);

module.exports = router;
