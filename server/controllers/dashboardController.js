const { pool } = require('../config/db');

// Get Dashboard Data (Tailored by Role)
exports.getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;

    if (role === 'admin') {
      // 1. Admin Queries
      const [[{ total_patients }]] = await pool.query('SELECT COUNT(*) as total_patients FROM patients');
      const [[{ total_doctors }]] = await pool.query('SELECT COUNT(*) as total_doctors FROM doctors');
      const [[{ total_staff }]] = await pool.query('SELECT COUNT(*) as total_staff FROM staff');
      const [[{ total_appointments }]] = await pool.query('SELECT COUNT(*) as total_appointments FROM appointments');
      const [[{ active_admissions }]] = await pool.query('SELECT COUNT(*) as active_admissions FROM patients WHERE admission_status = "Admitted"');
      
      const [recent_activities] = await pool.query(
        `SELECT al.*, u.name as user_name 
         FROM audit_logs al 
         LEFT JOIN users u ON al.user_id = u.id 
         ORDER BY al.created_at DESC 
         LIMIT 5`
      );

      return res.status(200).json({
        role: 'admin',
        stats: {
          totalPatients: total_patients,
          totalDoctors: total_doctors,
          totalStaff: total_staff,
          totalAppointments: total_appointments,
          activeAdmissions: active_admissions
        },
        recentActivities: recent_activities
      });

    } else if (role === 'doctor') {
      // 2. Doctor Queries
      const doctorId = req.user.profileId;
      if (!doctorId) {
        return res.status(400).json({ message: 'Doctor profile not found' });
      }

      const [[{ assigned_patients }]] = await pool.query('SELECT COUNT(*) as assigned_patients FROM patients WHERE assigned_doctor_id = ?', [doctorId]);
      const [[{ today_appointments }]] = await pool.query('SELECT COUNT(*) as today_appointments FROM appointments WHERE doctor_id = ? AND appointment_date = CURDATE()', [doctorId]);
      const [[{ pending_appointments }]] = await pool.query('SELECT COUNT(*) as pending_appointments FROM appointments WHERE doctor_id = ? AND status = "Pending"', [doctorId]);

      const [patients_list] = await pool.query(
        'SELECT id, patient_code, name, age, gender, admission_status FROM patients WHERE assigned_doctor_id = ? ORDER BY created_at DESC LIMIT 5',
        [doctorId]
      );

      const [appointments_list] = await pool.query(
        `SELECT a.*, p.name as patient_name 
         FROM appointments a 
         JOIN patients p ON a.patient_id = p.id 
         WHERE a.doctor_id = ? AND a.appointment_date = CURDATE() 
         ORDER BY a.appointment_time ASC`,
        [doctorId]
      );

      return res.status(200).json({
        role: 'doctor',
        stats: {
          assignedPatients: assigned_patients,
          todayAppointments: today_appointments,
          pendingAppointments: pending_appointments
        },
        patients: patients_list,
        appointments: appointments_list
      });

    } else if (role === 'staff') {
      // 3. Staff Queries
      const [[{ total_patients }]] = await pool.query('SELECT COUNT(*) as total_patients FROM patients');
      const [[{ today_appointments }]] = await pool.query('SELECT COUNT(*) as today_appointments FROM appointments WHERE appointment_date = CURDATE()');
      const [[{ active_admissions }]] = await pool.query('SELECT COUNT(*) as active_admissions FROM patients WHERE admission_status = "Admitted"');

      const [upcoming_appointments] = await pool.query(
        `SELECT a.*, p.name as patient_name, d.name as doctor_name 
         FROM appointments a 
         JOIN patients p ON a.patient_id = p.id 
         JOIN doctors d ON a.doctor_id = d.id 
         WHERE a.appointment_date >= CURDATE()
         ORDER BY a.appointment_date ASC, a.appointment_time ASC 
         LIMIT 5`
      );

      return res.status(200).json({
        role: 'staff',
        stats: {
          totalPatients: total_patients,
          todayAppointments: today_appointments,
          activeAdmissions: active_admissions
        },
        upcomingAppointments: upcoming_appointments
      });
    }

    res.status(400).json({ message: 'Invalid role' });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
