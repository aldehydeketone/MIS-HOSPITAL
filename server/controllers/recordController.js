const { pool } = require('../config/db');
const { logAction } = require('../services/auditService');

// Create Medical Record (Doctor only)
exports.createRecord = async (req, res) => {
  try {
    const { patient_id, diagnosis, prescription, notes } = req.body;
    const doctorId = req.user.profileId;

    if (!patient_id || !diagnosis || !prescription) {
      return res.status(400).json({ message: 'Patient, diagnosis, and prescription are required' });
    }

    // Retrieve patient profile
    const [patients] = await pool.query('SELECT * FROM patients WHERE id = ?', [patient_id]);
    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const patient = patients[0];

    // Privacy Check: Only the assigned doctor can write records for this patient
    if (patient.assigned_doctor_id !== doctorId) {
      await logAction(
        req.user.id,
        'UNAUTHORIZED_MEDICAL_RECORD_WRITE_ATTEMPT',
        'patients',
        patient_id,
        `Doctor attempted unauthorized write of medical record for patient: ${patient.name}`
      );
      return res.status(403).json({ message: 'Forbidden: You are not the assigned doctor for this patient.' });
    }

    // Insert record
    const [result] = await pool.query(
      'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?)',
      [patient_id, doctorId, diagnosis, prescription, notes || null]
    );

    const recordId = result.insertId;

    await logAction(
      req.user.id,
      'CREATE_MEDICAL_RECORD',
      'medical_records',
      recordId,
      `Created medical record for patient ${patient.name}`
    );

    res.status(201).json({
      message: 'Medical record created successfully',
      recordId
    });

  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Medical Records for a specific Patient (Admin, Doctor)
exports.getRecordsByPatient = async (req, res) => {
  try {
    const patientId = req.params.patientId;

    // Retrieve patient
    const [patients] = await pool.query('SELECT * FROM patients WHERE id = ?', [patientId]);
    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const patient = patients[0];

    // Privacy Checks
    if (req.user.role === 'doctor') {
      const doctorId = req.user.profileId;
      if (patient.assigned_doctor_id !== doctorId) {
        await logAction(
          req.user.id,
          'UNAUTHORIZED_MEDICAL_RECORD_READ_ATTEMPT',
          'patients',
          patientId,
          `Doctor attempted unauthorized read of medical records for patient: ${patient.name}`
        );
        return res.status(403).json({ message: 'Forbidden: You are not authorized to view this patient\'s medical records.' });
      }
    } else if (req.user.role !== 'admin') {
      // Staff or other roles are blocked
      return res.status(403).json({ message: 'Forbidden: Staff cannot access patient medical records.' });
    }

    // Query records
    const [records] = await pool.query(
      `SELECT r.*, d.name as doctor_name 
       FROM medical_records r 
       JOIN doctors d ON r.doctor_id = d.id 
       WHERE r.patient_id = ? 
       ORDER BY r.created_at DESC`,
      [patientId]
    );

    await logAction(
      req.user.id,
      'VIEW_MEDICAL_RECORDS',
      'patients',
      patientId,
      `Viewed medical records for patient ${patient.name}`
    );

    res.status(200).json({ records });

  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
