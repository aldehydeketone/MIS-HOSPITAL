const { pool } = require('../config/db');
const { logAction } = require('../services/auditService');

// Create Appointment (Admin, Staff only)
exports.createAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status } = req.body;

    if (!patient_id || !doctor_id || !appointment_date || !appointment_time || !appointment_type) {
      return res.status(400).json({ message: 'Patient, doctor, date, time, and type are required' });
    }

    // Verify patient and doctor exist
    const [patients] = await pool.query('SELECT name FROM patients WHERE id = ?', [patient_id]);
    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const [doctors] = await pool.query('SELECT name FROM doctors WHERE id = ?', [doctor_id]);
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const [result] = await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status) VALUES (?, ?, ?, ?, ?, ?)',
      [patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status || 'Scheduled']
    );

    const newAppointmentId = result.insertId;

    await logAction(
      req.user.id,
      'CREATE_APPOINTMENT',
      'appointments',
      newAppointmentId,
      `Scheduled appointment for patient ${patients[0].name} with Dr. ${doctors[0].name}`
    );

    res.status(201).json({
      message: 'Appointment scheduled successfully',
      appointmentId: newAppointmentId
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Appointments (Filtered by Role)
exports.getAllAppointments = async (req, res) => {
  try {
    let appointments;
    if (req.user.role === 'doctor') {
      const doctorId = req.user.profileId;
      [appointments] = await pool.query(
        `SELECT a.*, p.name as patient_name, d.name as doctor_name 
         FROM appointments a 
         JOIN patients p ON a.patient_id = p.id 
         JOIN doctors d ON a.doctor_id = d.id 
         WHERE a.doctor_id = ?`,
        [doctorId]
      );
    } else {
      [appointments] = await pool.query(
        `SELECT a.*, p.name as patient_name, d.name as doctor_name 
         FROM appointments a 
         JOIN patients p ON a.patient_id = p.id 
         JOIN doctors d ON a.doctor_id = d.id`
      );
    }

    res.status(200).json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Appointment Status (Admin, Staff, Doctor)
exports.updateAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { status, appointment_date, appointment_time, appointment_type } = req.body;

    const [appointments] = await pool.query('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appointment = appointments[0];

    // If Doctor, verify it is their own appointment and they are only changing status
    if (req.user.role === 'doctor') {
      if (appointment.doctor_id !== req.user.profileId) {
        await logAction(
          req.user.id,
          'UNAUTHORIZED_APPOINTMENT_UPDATE_ATTEMPT',
          'appointments',
          appointmentId,
          `Attempted to update appointment for doctor ${appointment.doctor_id}`
        );
        return res.status(403).json({ message: 'Forbidden: You can only update your own appointments.' });
      }

      // Update ONLY status for Doctor
      await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, appointmentId]);
    } else {
      // Admin / Staff can update all fields
      const newDate = appointment_date || appointment.appointment_date;
      const newTime = appointment_time || appointment.appointment_time;
      const newType = appointment_type || appointment.appointment_type;
      const newStatus = status || appointment.status;

      await pool.query(
        'UPDATE appointments SET appointment_date = ?, appointment_time = ?, appointment_type = ?, status = ? WHERE id = ?',
        [newDate, newTime, newType, newStatus, appointmentId]
      );
    }

    await logAction(
      req.user.id,
      'UPDATE_APPOINTMENT',
      'appointments',
      appointmentId,
      `Updated appointment status to: ${status}`
    );

    res.status(200).json({ message: 'Appointment updated successfully' });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
