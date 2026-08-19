const { pool } = require('../config/db');
const { logAction } = require('../services/auditService');

// Create Patient (Admin, Staff)
exports.createPatient = async (req, res) => {
  try {
    const { patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id } = req.body;

    if (!patient_code || !name || !age || !gender) {
      return res.status(400).json({ message: 'Patient code, name, age, and gender are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [patient_code, name, age, gender, contact || null, address || null, admission_status || 'Outpatient', assigned_doctor_id || null]
    );

    const newPatientId = result.insertId;

    await logAction(req.user.id, 'CREATE_PATIENT', 'patients', newPatientId, `Created patient ${name} (${patient_code})`);

    res.status(201).json({
      message: 'Patient created successfully',
      patientId: newPatientId
    });
  } catch (error) {
    console.error('Create patient error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Patient code already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Patients (Admin, Staff see all; Doctor sees only assigned)
exports.getAllPatients = async (req, res) => {
  try {
    let patients;
    if (req.user.role === 'doctor') {
      const doctorId = req.user.profileId;
      if (!doctorId) {
        return res.status(403).json({ message: 'Doctor profile not found' });
      }
      [patients] = await pool.query(
        'SELECT p.*, d.name as doctor_name FROM patients p LEFT JOIN doctors d ON p.assigned_doctor_id = d.id WHERE p.assigned_doctor_id = ?',
        [doctorId]
      );
    } else {
      [patients] = await pool.query(
        'SELECT p.*, d.name as doctor_name FROM patients p LEFT JOIN doctors d ON p.assigned_doctor_id = d.id'
      );
    }

    res.status(200).json({ patients });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Patient Details (Admin, Staff see all; Doctor restricted to assigned)
exports.getPatientById = async (req, res) => {
  try {
    const patientId = req.params.id;

    const [patients] = await pool.query(
      'SELECT p.*, d.name as doctor_name FROM patients p LEFT JOIN doctors d ON p.assigned_doctor_id = d.id WHERE p.id = ?',
      [patientId]
    );

    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const patient = patients[0];

    // Privacy Check for Doctor
    if (req.user.role === 'doctor') {
      if (patient.assigned_doctor_id !== req.user.profileId) {
        await logAction(
          req.user.id,
          'UNAUTHORIZED_PATIENT_ACCESS_ATTEMPT',
          'patients',
          patientId,
          `Attempted unauthorized view of patient: ${patient.name}`
        );
        return res.status(403).json({ message: 'Forbidden: You are not authorized to access this patient record.' });
      }
    }

    await logAction(req.user.id, 'VIEW_PATIENT', 'patients', patientId, `Viewed patient ${patient.name}`);

    res.status(200).json({ patient });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Patient (Admin, Staff)
exports.updatePatient = async (req, res) => {
  try {
    const patientId = req.params.id;
    const { name, age, gender, contact, address, admission_status, assigned_doctor_id } = req.body;

    const [patients] = await pool.query('SELECT * FROM patients WHERE id = ?', [patientId]);
    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await pool.query(
      'UPDATE patients SET name = ?, age = ?, gender = ?, contact = ?, address = ?, admission_status = ?, assigned_doctor_id = ? WHERE id = ?',
      [name, age, gender, contact || null, address || null, admission_status || 'Outpatient', assigned_doctor_id || null, patientId]
    );

    await logAction(req.user.id, 'UPDATE_PATIENT', 'patients', patientId, `Updated patient profile for ${name}`);

    res.status(200).json({ message: 'Patient updated successfully' });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete Patient (Admin only)
exports.deletePatient = async (req, res) => {
  try {
    const patientId = req.params.id;

    const [patients] = await pool.query('SELECT * FROM patients WHERE id = ?', [patientId]);
    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const patient = patients[0];

    await pool.query('DELETE FROM patients WHERE id = ?', [patientId]);

    await logAction(req.user.id, 'DELETE_PATIENT', 'patients', patientId, `Deleted patient ${patient.name}`);

    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
