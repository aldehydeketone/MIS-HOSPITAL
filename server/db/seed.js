const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seed() {
  try {
    console.log('Starting database seeding with real-world Indian clinic profiles...');

    // 1. Clear database
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE audit_logs');
    await pool.query('TRUNCATE TABLE medical_records');
    await pool.query('TRUNCATE TABLE appointments');
    await pool.query('TRUNCATE TABLE patients');
    await pool.query('TRUNCATE TABLE staff');
    await pool.query('TRUNCATE TABLE doctors');
    await pool.query('TRUNCATE TABLE users');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Database tables cleared.');

    // 2. Hash password
    const hashedPassword = await bcrypt.hash('Password123', 10);

    // 3. Create Users
    const [adminUser] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@hospital.test', hashedPassword, 'admin']
    );
    const adminUserId = adminUser.insertId;

    const [docAUser] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Dr. Rajesh Verma', 'doctorA@hospital.test', hashedPassword, 'doctor']
    );
    const docAUserId = docAUser.insertId;

    const [docBUser] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Dr. Sunita Patel', 'doctorB@hospital.test', hashedPassword, 'doctor']
    );
    const docBUserId = docBUser.insertId;

    const [docCUser] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Dr. Amit Saxena', 'doctorC@hospital.test', hashedPassword, 'doctor']
    );
    const docCUserId = docCUser.insertId;

    const [docDUser] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Dr. Shalini Reddy', 'doctorD@hospital.test', hashedPassword, 'doctor']
    );
    const docDUserId = docDUser.insertId;

    const [docEUser] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Dr. Vikram Malhotra', 'doctorE@hospital.test', hashedPassword, 'doctor']
    );
    const docEUserId = docEUser.insertId;

    const [staffUser] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Priya Iyer', 'staff@hospital.test', hashedPassword, 'staff']
    );
    const staffUserId = staffUser.insertId;

    const [staffBUser] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Harish Kumar', 'staffB@hospital.test', hashedPassword, 'staff']
    );
    const staffBUserId = staffBUser.insertId;

    console.log('Default users created.');

    // 4. Create Doctor Profiles
    const [docAProfile] = await pool.query(
      'INSERT INTO doctors (user_id, name, specialization, department, contact, availability) VALUES (?, ?, ?, ?, ?, ?)',
      [docAUserId, 'Rajesh Verma', 'Cardiology', 'Cardiovascular Sciences', '9876543201', 'Mon-Wed-Fri 9AM-4PM']
    );
    const docAId = docAProfile.insertId;

    const [docBProfile] = await pool.query(
      'INSERT INTO doctors (user_id, name, specialization, department, contact, availability) VALUES (?, ?, ?, ?, ?, ?)',
      [docBUserId, 'Sunita Patel', 'Pediatrics', 'Child Health', '9876543202', 'Tue-Thu 10AM-5PM']
    );
    const docBId = docBProfile.insertId;

    const [docCProfile] = await pool.query(
      'INSERT INTO doctors (user_id, name, specialization, department, contact, availability) VALUES (?, ?, ?, ?, ?, ?)',
      [docCUserId, 'Amit Saxena', 'Orthopedics', 'Bone & Joint Clinic', '9876543203', 'Mon-Fri 11AM-3PM']
    );
    const docCId = docCProfile.insertId;

    const [docDProfile] = await pool.query(
      'INSERT INTO doctors (user_id, name, specialization, department, contact, availability) VALUES (?, ?, ?, ?, ?, ?)',
      [docDUserId, 'Shalini Reddy', 'Gynecology', 'Obstetrics & Gynecology', '9876543204', 'Mon-Thu-Sat 9AM-1PM']
    );
    const docDId = docDProfile.insertId;

    const [docEProfile] = await pool.query(
      'INSERT INTO doctors (user_id, name, specialization, department, contact, availability) VALUES (?, ?, ?, ?, ?, ?)',
      [docEUserId, 'Vikram Malhotra', 'Neurology', 'Neurosciences', '9876543205', 'Tue-Fri 2PM-6PM']
    );
    const docEId = docEProfile.insertId;

    console.log('Doctor profiles created.');

    // 5. Create Staff Profiles
    await pool.query(
      'INSERT INTO staff (user_id, name, department, contact) VALUES (?, ?, ?, ?)',
      [staffUserId, 'Priya Iyer', 'Outpatient Services', '9876543210']
    );
    await pool.query(
      'INSERT INTO staff (user_id, name, department, contact) VALUES (?, ?, ?, ?)',
      [staffBUserId, 'Harish Kumar', 'Inpatient Admissions', '9876543211']
    );

    console.log('Staff profiles created.');

    // 6. Create Patients
    const [pat1] = await pool.query(
      'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['PT-1001', 'Aarav Sharma', 42, 'Male', '9876543210', '14 MG Road, Pune', 'Outpatient', docAId]
    );
    const pat1Id = pat1.insertId;

    const [pat2] = await pool.query(
      'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['PT-1002', 'Neha Shah', 29, 'Female', '9812345678', '7 Linking Road, Mumbai', 'Admitted', docBId]
    );
    const pat2Id = pat2.insertId;

    const [pat3] = await pool.query(
      'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['PT-1003', 'Vikram Deshmukh', 56, 'Male', '9945678901', '23 Civil Lines, Nagpur', 'Admitted', docAId]
    );
    const pat3Id = pat3.insertId;

    const [pat4] = await pool.query(
      'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['PT-1004', 'Kavita Krishnan', 34, 'Female', '9765432109', '45 Avinashi Road, Coimbatore', 'Outpatient', docDId]
    );
    const pat4Id = pat4.insertId;

    const [pat5] = await pool.query(
      'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['PT-1005', 'Rajesh Koothrapali', 68, 'Male', '9823456712', '102 Sector-C, Noida', 'Discharged', docEId]
    );
    const pat5Id = pat5.insertId;

    const [pat6] = await pool.query(
      'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['PT-1006', 'Ananya Birla', 15, 'Female', '9654321987', 'Malabar Hill, Mumbai', 'Outpatient', docBId]
    );
    const pat6Id = pat6.insertId;

    console.log('Patient records created.');

    const today = new Date().toISOString().split('T')[0];

    // 7. Create Appointments
    await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status) VALUES (?, ?, ?, ?, ?, ?)',
      [pat1Id, docAId, today, '10:00:00', 'Consultation', 'Scheduled']
    );
    await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status) VALUES (?, ?, ?, ?, ?, ?)',
      [pat2Id, docBId, today, '14:30:00', 'Follow-up', 'Pending']
    );
    await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status) VALUES (?, ?, ?, ?, ?, ?)',
      [pat3Id, docAId, today, '11:30:00', 'Checkup', 'Scheduled']
    );
    await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status) VALUES (?, ?, ?, ?, ?, ?)',
      [pat4Id, docDId, today, '09:30:00', 'Consultation', 'Scheduled']
    );

    console.log('Appointments scheduled.');

    // 8. Create Medical Records
    await pool.query(
      'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?)',
      [pat1Id, docAId, 'Mild Hypertension', 'Amlodipine 5mg once daily', 'Follow up in 4 weeks. Patient to monitor BP daily.']
    );
    await pool.query(
      'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?)',
      [pat2Id, docBId, 'Allergic Rhinitis', 'Cetirizine 10mg as needed', 'Avoid dust and pollen. Repeat skin test next visit.']
    );
    await pool.query(
      'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?)',
      [pat3Id, docAId, 'Type 2 Diabetes', 'Metformin 500mg twice daily with meals', 'Monitor blood glucose weekly. Dietary counselling advised.']
    );

    console.log('Medical records added.');

    // 9. Initial Audit Logs
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [adminUserId, 'SYSTEM_INIT_SEED', 'users', adminUserId, 'Database seeded with real-world Indian clinic profiles.']
    );

    console.log('Database seeding complete successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Database seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
