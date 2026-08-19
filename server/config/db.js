const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'hospital_mis',
  port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the MySQL database pool.');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database Connection Error:', error.message);
    console.error('Please verify your MySQL configurations in server/.env file.');
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
