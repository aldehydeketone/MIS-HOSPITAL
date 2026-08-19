const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
  const host = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
  const user = process.env.MYSQLUSER || process.env.DB_USER || 'root';
  const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '1234';
  const port = parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306');
  const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME || 'hospital_mis';

  try {
    console.log(`Connecting to ${host}:${port} database ${dbName}...`);
    const connection = await mysql.createConnection({ host, user, password, port, database: dbName });
    const [rows] = await connection.query('SHOW TABLES');
    console.log('Tables:', rows);
    await connection.end();
  } catch (e) {
    console.error('Error:', e.message);
  }
}
check();
