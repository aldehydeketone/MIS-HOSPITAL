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

    // If tables don't exist, create them
    if (tables.length === 0) {
      console.log('Database Initializer: Database is empty. Loading schema.sql...');
      await applySchema(connection);
    } else {
      console.log('Database Initializer: Tables already exist.');
      
      // Let's check if the new real-world data (like Dr. Rajesh Verma) exists.
      // If not, we will re-initialize and re-seed to make sure the app has the new profiles!
      try {
        const [users] = await connection.query("SELECT COUNT(*) as count FROM users WHERE name = 'Dr. Rajesh Verma'");
        if (users[0].count === 0) {
          console.log('Database Initializer: Legacy/old data detected. Wiping and seeding new real-world data...');
          await connection.query('SET FOREIGN_KEY_CHECKS = 0');
          await connection.query('DROP TABLE IF EXISTS audit_logs');
          await connection.query('DROP TABLE IF EXISTS medical_records');
          await connection.query('DROP TABLE IF EXISTS appointments');
          await connection.query('DROP TABLE IF EXISTS patients');
          await connection.query('DROP TABLE IF EXISTS staff');
          await connection.query('DROP TABLE IF EXISTS doctors');
          await connection.query('DROP TABLE IF EXISTS users');
          await connection.query('SET FOREIGN_KEY_CHECKS = 1');
          
          await applySchema(connection);
        }
      } catch (err) {
        console.log('Database Initializer: Error checking for real-world data, will re-apply schema:', err.message);
        await applySchema(connection);
      }
    }

    // Check if users exist and seed if 0
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (userCount[0].count === 0) {
      console.log('Database Initializer: Seeding default real-world Indian clinical data...');
      
      const hashedPassword = await bcrypt.hash('Password123', 10);

      // Create Users
      const [adminUser] = await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@hospital.test', hashedPassword, 'admin']
      );
      const adminUserId = adminUser.insertId;

      const [docAUser] = await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Dr. Rajesh Verma', 'doctorA@hospital.test', hashedPassword, 'doctor']
      );
      const docAUserId = docAUser.insertId;

      const [docBUser] = await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Dr. Sunita Patel', 'doctorB@hospital.test', hashedPassword, 'doctor']
      );
      const docBUserId = docBUser.insertId;

      const [docCUser] = await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Dr. Amit Saxena', 'doctorC@hospital.test', hashedPassword, 'doctor']
      );
      const docCUserId = docCUser.insertId;

      const [docDUser] = await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Dr. Shalini Reddy', 'doctorD@hospital.test', hashedPassword, 'doctor']
      );
      const docDUserId = docDUser.insertId;

      const [docEUser] = await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Dr. Vikram Malhotra', 'doctorE@hospital.test', hashedPassword, 'doctor']
      );
      const docEUserId = docEUser.insertId;

      const [staffUser] = await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Priya Iyer', 'staff@hospital.test', hashedPassword, 'staff']
      );
      const staffUserId = staffUser.insertId;

      const [staffBUser] = await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Harish Kumar', 'staffB@hospital.test', hashedPassword, 'staff']
      );
      const staffBUserId = staffBUser.insertId;

      // Create Doctor Profiles
      const [docAProfile] = await connection.query(
        'INSERT INTO doctors (user_id, name, specialization, department, contact, availability) VALUES (?, ?, ?, ?, ?, ?)',
        [docAUserId, 'Rajesh Verma', 'Cardiology', 'Cardiovascular Sciences', '9876543201', 'Mon-Wed-Fri 9AM-4PM']
      );
      const docAId = docAProfile.insertId;

      const [docBProfile] = await connection.query(
        'INSERT INTO doctors (user_id, name, specialization, department, contact, availability) VALUES (?, ?, ?, ?, ?, ?)',
        [docBUserId, 'Sunita Patel', 'Pediatrics', 'Child Health', '9876543202', 'Tue-Thu 10AM-5PM']
      );
      const docBId = docBProfile.insertId;

      const [docCProfile] = await connection.query(
        'INSERT INTO doctors (user_id, name, specialization, department, contact, availability) VALUES (?, ?, ?, ?, ?, ?)',
        [docCUserId, 'Amit Saxena', 'Orthopedics', 'Bone & Joint Clinic', '9876543203', 'Mon-Fri 11AM-3PM']
      );
      const docCId = docCProfile.insertId;

      const [docDProfile] = await connection.query(
        'INSERT INTO doctors (user_id, name, specialization, department, contact, availability) VALUES (?, ?, ?, ?, ?, ?)',
        [docDUserId, 'Shalini Reddy', 'Gynecology', 'Obstetrics & Gynecology', '9876543204', 'Mon-Thu-Sat 9AM-1PM']
      );
      const docDId = docDProfile.insertId;

      const [docEProfile] = await connection.query(
        'INSERT INTO doctors (user_id, name, specialization, department, contact, availability) VALUES (?, ?, ?, ?, ?, ?)',
        [docEUserId, 'Vikram Malhotra', 'Neurology', 'Neurosciences', '9876543205', 'Tue-Fri 2PM-6PM']
      );
      const docEId = docEProfile.insertId;

      // Create Staff Profiles
      await connection.query(
        'INSERT INTO staff (user_id, name, department, contact) VALUES (?, ?, ?, ?)',
        [staffUserId, 'Priya Iyer', 'Outpatient Services', '9876543210']
      );
      await connection.query(
        'INSERT INTO staff (user_id, name, department, contact) VALUES (?, ?, ?, ?)',
        [staffBUserId, 'Harish Kumar', 'Inpatient Admissions', '9876543211']
      );

      // Create Patients
      const [pat1] = await connection.query(
        'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['PT-1001', 'Aarav Sharma', 42, 'Male', '9876543210', '14 MG Road, Pune', 'Outpatient', docAId]
      );
      const pat1Id = pat1.insertId;

      const [pat2] = await connection.query(
        'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['PT-1002', 'Neha Shah', 29, 'Female', '9812345678', '7 Linking Road, Mumbai', 'Admitted', docBId]
      );
      const pat2Id = pat2.insertId;

      const [pat3] = await connection.query(
        'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['PT-1003', 'Vikram Deshmukh', 56, 'Male', '9945678901', '23 Civil Lines, Nagpur', 'Admitted', docAId]
      );
      const pat3Id = pat3.insertId;

      const [pat4] = await connection.query(
        'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['PT-1004', 'Kavita Krishnan', 34, 'Female', '9765432109', '45 Avinashi Road, Coimbatore', 'Outpatient', docDId]
      );
      const pat4Id = pat4.insertId;

      const [pat5] = await connection.query(
        'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['PT-1005', 'Rajesh Koothrapali', 68, 'Male', '9823456712', '102 Sector-C, Noida', 'Discharged', docEId]
      );
      const pat5Id = pat5.insertId;

      const [pat6] = await connection.query(
        'INSERT INTO patients (patient_code, name, age, gender, contact, address, admission_status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['PT-1006', 'Ananya Birla', 15, 'Female', '9654321987', 'Malabar Hill, Mumbai', 'Outpatient', docBId]
      );
      const pat6Id = pat6.insertId;

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
      await connection.query(
        'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status) VALUES (?, ?, ?, ?, ?, ?)',
        [pat4Id, docDId, today, '09:30:00', 'Consultation', 'Scheduled']
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
        [adminUserId, 'SYSTEM_INIT_SEED', 'users', adminUserId, 'Database seeded with real-world Indian clinic profiles.']
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

async function applySchema(connection) {
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
}

module.exports = initializeAndSeedDatabase;
