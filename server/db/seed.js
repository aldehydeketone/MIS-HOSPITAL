const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seed() {
  try {
    console.log('Starting database seeding...');

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
      ['Dr. Ananya Mehta', 'doctorA@hospital.test', hashedPassword, 'doctor']
    );
    const docAUserId = docAUser.insertId;

    const [docBUser] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Dr. Rohan Kulkarni', 'doctorB@hospital.test', hashedPassword, 'doctor']
    );
    const docBUserId = docBUser.insertId;

    const [staffUser] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Priya Iyer', 'staff@hospital.test', hashedPassword, 'staff']
    );
    const staffUserId = staffUser.insertId;

    console.log('Default users created.');

    // 4. Create Doctor Profiles
    const [docAProfile] = await pool.query(
      'INSERT INTO doctors (user_id, name, specialization, department, contact, availability) VALUES (?, ?, ?, ?, ?, ?)',
      [docAUserId, 'Ananya Mehta', 'Cardiology', 'Cardiovascular Sciences', '555-0101', 'Mon-Wed-Fri 9AM-4PM']
    );
    const docAId = docAProfile.insertId;

    const [docBProfile] = await pool.query(
      'INSERT INTO doctors (user_id, name, specialization, department, contact, availability) VALUES (?, ?, ?, ?, ?, ?)',
      [docBUserId, 'Rohan Kulkarni', 'Pediatrics', 'Child Health', '555-0202', 'Tue-Thu 10AM-5PM']
    );
    const docBId = docBProfile.insertId;

    console.log('Doctor profiles created.');

    // 5. Create Staff Profile
    await pool.query(
      'INSERT INTO staff (user_id, name, department, contact) VALUES (?, ?, ?, ?)',
      [staffUserId, 'Priya Iyer', 'Outpatient Services', '555-0303']
    );

    console.log('Staff profile created.');

    // 6. Create Patients
    const [pat1] = await pool.query(
      'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['PT-2291', 'Aarav Sharma', 42, 'Male', '555-1111', '14 MG Road, Pune', 'Outpatient', docAId]
    );
    const pat1Id = pat1.insertId;

    const [pat2] = await pool.query(
      'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['PT-2292', 'Neha Shah', 29, 'Female', '555-2222', '7 Linking Road, Mumbai', 'Admitted', docBId]
    );
    const pat2Id = pat2.insertId;

    const [pat3] = await pool.query(
      'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['PT-2310', 'Vikram Deshmukh', 56, 'Male', '555-3333', '23 Civil Lines, Nagpur', 'Admitted', docAId]
    );
    const pat3Id = pat3.insertId;

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
      [adminUserId, 'SYSTEM_INIT_SEED', 'users', adminUserId, 'Database seeded with default demonstration records.']
    );

    console.log('Database seeding complete successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Database seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
