const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Get all patients (Admin, Staff see all; Doctor sees only assigned)
router.get('/', protect, authorizeRoles('admin', 'staff', 'doctor'), patientController.getAllPatients);

// Create patient (Admin, Staff only)
router.post('/', protect, authorizeRoles('admin', 'staff'), patientController.createPatient);

// Get patient details (Admin, Staff see all; Doctor sees assigned only)
router.get('/:id', protect, authorizeRoles('admin', 'staff', 'doctor'), patientController.getPatientById);

// Update patient (Admin, Staff only)
router.put('/:id', protect, authorizeRoles('admin', 'staff'), patientController.updatePatient);

// Delete patient (Admin only)
router.delete('/:id', protect, authorizeRoles('admin'), patientController.deletePatient);

module.exports = router;
