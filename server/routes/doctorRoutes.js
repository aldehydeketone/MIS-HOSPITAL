const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Get all doctors (Admin, Staff, Doctor)
router.get('/', protect, authorizeRoles('admin', 'staff', 'doctor'), doctorController.getAllDoctors);

// Create doctor profile and user account (Admin only)
router.post('/', protect, authorizeRoles('admin'), doctorController.createDoctor);

// Get specific doctor details (Admin, Staff, Doctor)
router.get('/:id', protect, authorizeRoles('admin', 'staff', 'doctor'), doctorController.getDoctorById);

// Update doctor profile (Admin only)
router.put('/:id', protect, authorizeRoles('admin'), doctorController.updateDoctor);

// Delete doctor profile (Admin only)
router.delete('/:id', protect, authorizeRoles('admin'), doctorController.deleteDoctor);

module.exports = router;
