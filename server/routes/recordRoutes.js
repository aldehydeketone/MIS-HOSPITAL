const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Create medical record (Doctor only)
router.post('/', protect, authorizeRoles('doctor'), recordController.createRecord);

// Get medical records for patient (Admin and Doctor only)
router.get('/:patientId', protect, authorizeRoles('admin', 'doctor'), recordController.getRecordsByPatient);

module.exports = router;
