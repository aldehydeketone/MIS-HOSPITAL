const dotenv = require('dotenv');
const { app, server } = require('../server');

dotenv.config();

const testPort = 5001;
const baseUrl = `http://localhost:${testPort}`;

async function runTests() {
  console.log('\n--- STARTING INTEGRATION TESTS ---\n');
  let exitCode = 0;

  // Let the database connections initialize
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    // Test 1: Healthcheck
    console.log('Test 1: Health Check Endpoint');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    if (healthRes.status === 200 && healthData.status === 'success') {
      console.log('✅ PASS: Healthcheck successful');
    } else {
      throw new Error(`Healthcheck failed: ${healthRes.status}`);
    }

    // Test 2: Admin Login
    console.log('\nTest 2: Admin Login');
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hospital.test', password: 'Password123' })
    });
    const adminLoginData = await adminLoginRes.json();
    if (adminLoginRes.status === 200 && adminLoginData.token) {
      console.log('✅ PASS: Admin login successful');
    } else {
      throw new Error(`Admin login failed: ${adminLoginRes.status} ${adminLoginData.message}`);
    }
    const adminToken = adminLoginData.token;

    // Test 3: Invalid Login
    console.log('\nTest 3: Invalid Login Credentials');
    const invalidLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hospital.test', password: 'WrongPassword' })
    });
    if (invalidLoginRes.status === 401) {
      console.log('✅ PASS: Correctly rejected invalid login');
    } else {
      throw new Error(`Invalid login should return 401 but returned ${invalidLoginRes.status}`);
    }

    // Test 4: Doctor A Login
    console.log('\nTest 4: Doctor A Login');
    const docALoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doctorA@hospital.test', password: 'Password123' })
    });
    const docALoginData = await docALoginRes.json();
    if (docALoginRes.status === 200 && docALoginData.token) {
      console.log('✅ PASS: Doctor A login successful');
    } else {
      throw new Error(`Doctor A login failed: ${docALoginRes.status}`);
    }
    const docAToken = docALoginData.token;

    // Test 5: Staff Login
    console.log('\nTest 5: Staff Login');
    const staffLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'staff@hospital.test', password: 'Password123' })
    });
    const staffLoginData = await staffLoginRes.json();
    if (staffLoginRes.status === 200 && staffLoginData.token) {
      console.log('✅ PASS: Staff login successful');
    } else {
      throw new Error(`Staff login failed: ${staffLoginRes.status}`);
    }
    const staffToken = staffLoginData.token;

    // Test 6: Access Restriction (Doctor A fetching Patient assigned to Doctor B)
    console.log('\nTest 6: Privacy Check - Doctor A accessing Doctor B\'s Patient');
    // Patient 1 is assigned to Doc A (profileId = 1), Patient 2 is assigned to Doc B (profileId = 2)
    // Dr. Austin (Doctor A) tries to view Patient 2 (id = 2) details
    const unauthPatientRes = await fetch(`${baseUrl}/api/patients/2`, {
      headers: { 'Authorization': `Bearer ${docAToken}` }
    });
    const unauthPatientData = await unauthPatientRes.json();
    if (unauthPatientRes.status === 403) {
      console.log('✅ PASS: Doctor A was blocked from Doctor B\'s Patient (403 Forbidden)');
    } else {
      throw new Error(`Doctor A should have received 403 but got: ${unauthPatientRes.status} ${JSON.stringify(unauthPatientData)}`);
    }

    // Test 7: Staff Accessing Medical Records
    console.log('\nTest 7: Privacy Check - Staff accessing Patient Medical Records');
    const staffRecordRes = await fetch(`${baseUrl}/api/medical-records/1`, {
      headers: { 'Authorization': `Bearer ${staffToken}` }
    });
    if (staffRecordRes.status === 403) {
      console.log('✅ PASS: Staff member was blocked from viewing medical records (403 Forbidden)');
    } else {
      throw new Error(`Staff should be blocked (403) but got: ${staffRecordRes.status}`);
    }

    // Test 8: Authorized Doctor Record Access
    console.log('\nTest 8: Doctor A accessing Assigned Patient Medical Records');
    const authRecordRes = await fetch(`${baseUrl}/api/medical-records/1`, {
      headers: { 'Authorization': `Bearer ${docAToken}` }
    });
    const authRecordData = await authRecordRes.json();
    if (authRecordRes.status === 200 && Array.isArray(authRecordData.records)) {
      console.log(`✅ PASS: Doctor A successfully retrieved Patient 1 records (${authRecordData.records.length} records found)`);
    } else {
      throw new Error(`Doctor A failed to get Patient 1 records: ${authRecordRes.status}`);
    }

    // Test 9: Get Audit Logs (Admin only)
    console.log('\nTest 9: Admin Access to System Audit Logs');
    const logsRes = await fetch(`${baseUrl}/api/logs`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const logsData = await logsRes.json();
    if (logsRes.status === 200 && Array.isArray(logsData.logs)) {
      console.log(`✅ PASS: Admin successfully fetched ${logsData.logs.length} audit log entries`);
      
      // Look for the unauthorized access attempt from Test 6
      const unauthorizedLogs = logsData.logs.filter(log => log.action === 'UNAUTHORIZED_PATIENT_ACCESS_ATTEMPT');
      if (unauthorizedLogs.length > 0) {
        console.log(`✅ PASS: Found recorded unauthorized access breach in audit logs: "${unauthorizedLogs[0].details}"`);
      } else {
        console.warn('⚠️ WARNING: Unauthorized access logs not found in audit logs table');
      }
    } else {
      throw new Error(`Admin failed to fetch audit logs: ${logsRes.status}`);
    }

    console.log('\n🎉 ALL INTEGRATION TESTS COMPLETED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
    exitCode = 1;
  } finally {
    // Close express server to exit process
    console.log('\nStopping test server...');
    server.close(() => {
      console.log('Test server stopped.');
      process.exit(exitCode);
    });
  }
}

// Relisten to server on testing port to avoid collision with dev server
server.close(() => {
  server.listen(testPort, () => {
    runTests();
  });
});
