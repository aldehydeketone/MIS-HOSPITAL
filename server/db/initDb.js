const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function initDb() {
  try {
    console.log('Initializing database and tables...');
    
    // Connect without database selected first
    const connection = await mysql.createConnection({
      host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
      user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
      password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '1234',
      port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306')
    });

    console.log('Connected to MySQL server.');

    // Create database
    const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME || 'hospital_mis';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database "${dbName}" checked/created.`);

    // Use database
    await connection.query(`USE ${dbName}`);

    // Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Split queries by semicolon (excluding any semicolons inside comments/strings if simple, but simple split works for standard files)
    // We clean up comments and empty lines
    const queries = schemaSql
      .replace(/--.*$/gm, '') // Remove SQL comments
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    console.log(`Running ${queries.length} schema queries...`);
    for (const query of queries) {
      await connection.query(query);
    }

    console.log('Database tables successfully created.');
    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  }
}

initDb();
