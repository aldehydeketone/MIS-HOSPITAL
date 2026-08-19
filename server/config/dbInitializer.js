const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function initializeAndSeedDatabase() {
  const host = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
  const user = process.env.MYSQLUSER || process.env.DB_USER || 'root';
  const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '1234';
  const port = parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306');
  const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME || 'hospital_mis';

  try {
    console.log('Database Initializer: Connecting to MySQL server...');
    const connection = await mysql.createConnection({ host, user, password, port });
    
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database Initializer: Database "${dbName}" checked/created.`);
    await connection.query(`USE \`${dbName}\``);

    // Check if tables exist by querying information_schema
    const [tables] = await connection.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = ?`,
      [dbName]
    );

    if (tables.length === 0) {
      console.log('Database Initializer: Database is empty. Loading schema.sql...');
      const schemaPath = path.join(__dirname, '../db/schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');

      const queries = schemaSql
        .replace(/--.*$/gm, '') // Remove comments
        .split(';')
        .map(q => q.trim())
        .filter(q => q.length > 0);

      for (const query of queries) {
        await connection.query(query);
      }
      console.log('Database Initializer: Schema applied successfully.');
    } else {
      console.log('Database Initializer: Tables already exist. Skipping schema application.');
    }

    // Check if users exist
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      console.log('Database Initializer: No users found. Seeding default data...');
      
      const hashedPassword = await bcrypt.hash('Password123', 10);

      // Create Users
      const [adminUser] = await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@hospital.test', hashedPassword, 'admin']
      );
      const adminUserId = adminUser.insertId;

      const [docAUser] = await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Dr. Ananya Mehta', 'doctorA@hospital.test', hashedPassword, 'doctor']
      );
      const docAUserId = docAUser.insertId;

      const [docBUser] = await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Dr. Rohan Kulkarni', 'doctorB@hospital.test', hashedPassword, 'doctor']
      );
      const docBUserId = docBUser.insertId;

      const [staffUser] = await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Priya Iyer', 'staff@hospital.test', hashedPassword, 'staff']
      );
      const staffUserId = staffUser.insertId;

      // Create Doctor Profiles
      const [docAProfile] = await connection.query(
        'INSERT INTO doctors (user_id, name, specialization, department, contact, availability) VALUES (?, ?, ?, ?, ?, ?)',
        [docAUserId, 'Ananya Mehta', 'Cardiology', 'Cardiovascular Sciences', '555-0101', 'Mon-Wed-Fri 9AM-4PM']
      );
      const docAId = docAProfile.insertId;

      const [docBProfile] = await connection.query(
        'INSERT INTO doctors (user_id, name, specialization, department, contact, availability) VALUES (?, ?, ?, ?, ?, ?)',
        [docBUserId, 'Rohan Kulkarni', 'Pediatrics', 'Child Health', '555-0202', 'Tue-Thu 10AM-5PM']
      );
      const docBId = docBProfile.insertId;

      // Create Staff Profile
      await connection.query(
        'INSERT INTO staff (user_id, name, department, contact) VALUES (?, ?, ?, ?)',
        [staffUserId, 'Priya Iyer', 'Outpatient Services', '555-0303']
      );

      // Create Patients
      const [pat1] = await connection.query(
        'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['PT-2291', 'Aarav Sharma', 42, 'Male', '555-1111', '14 MG Road, Pune', 'Outpatient', docAId]
      );
      const pat1Id = pat1.insertId;

      const [pat2] = await connection.query(
        'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['PT-2292', 'Neha Shah', 29, 'Female', '555-2222', '7 Linking Road, Mumbai', 'Admitted', docBId]
      );
      const pat2Id = pat2.insertId;

      const [pat3] = await connection.query(
        'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['PT-2310', 'Vikram Deshmukh', 56, 'Male', '555-3333', '23 Civil Lines, Nagpur', 'Admitted', docAId]
      );
      const pat3Id = pat3.insertId;

      const today = new Date().toISOString().split('T')[0];

      // Create Appointments
      await connection.query(
        'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status) VALUES (?, ?, ?, ?, ?, ?)',
        [pat1Id, docAId, today, '10:00:00', 'Consultation', 'Scheduled']
      );
      await connection.query(
        'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status) VALUES (?, ?, ?, ?, ?, ?)',
        [pat2Id, docBId, today, '14:30:00', 'Follow-up', 'Pending']
      );
      await connection.query(
        'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status) VALUES (?, ?, ?, ?, ?, ?)',
        [pat3Id, docAId, today, '11:30:00', 'Checkup', 'Scheduled']
      );

      // Create Medical Records
      await connection.query(
        'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?)',
        [pat1Id, docAId, 'Mild Hypertension', 'Amlodipine 5mg once daily', 'Follow up in 4 weeks. Patient to monitor BP daily.']
      );
      await connection.query(
        'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?)',
        [pat2Id, docBId, 'Allergic Rhinitis', 'Cetirizine 10mg as needed', 'Avoid dust and pollen. Repeat skin test next visit.']
      );
      await connection.query(
        'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?)',
        [pat3Id, docAId, 'Type 2 Diabetes', 'Metformin 500mg twice daily with meals', 'Monitor blood glucose weekly. Dietary counselling advised.']
      );

      // Initial Audit Logs
      await connection.query(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [adminUserId, 'SYSTEM_INIT_SEED', 'users', adminUserId, 'Database seeded with default demonstration records.']
      );

      console.log('Database Initializer: Seeding complete.');
    } else {
      console.log('Database Initializer: Database already contains data. Skipping seeding.');
    }

    await connection.end();
  } catch (error) {
    console.error('Database Initializer: Error initializing database:', error.message);
  }
}

module.exports = initializeAndSeedDatabase;
