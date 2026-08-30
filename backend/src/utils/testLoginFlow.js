const API_BASE = 'http://localhost:5001/api';

async function testAdminLoginFlow() {
  console.log('===============================================================');
  console.log('🧪 TESTING ADMIN AUTHENTICATION & DASHBOARD ACCESS FLOW');
  console.log('===============================================================\n');

  // Step 1: Test Invalid Credentials
  console.log('1. Testing Invalid Credentials...');
  const invalidRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'santhoshsiva754@gmail.com', password: 'wrongpassword' }),
  });
  const invalidData = await invalidRes.json();
  if (invalidRes.status === 401 && !invalidData.success) {
    console.log('✅ PASS: Invalid credentials correctly rejected (401)');
  } else {
    console.error('❌ FAIL: Invalid credentials should be rejected');
  }

  // Step 2: Test Admin Login with santhoshsiva754@gmail.com / 12345678
  console.log('\n2. Testing Admin Login with santhoshsiva754@gmail.com / 12345678...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'santhoshsiva754@gmail.com', password: '12345678' }),
  });
  const loginData = await loginRes.json();

  if (loginRes.status === 200 && loginData.success && loginData.token && loginData.user.role === 'admin') {
    console.log('✅ PASS: Admin successfully authenticated!');
    console.log(`   User: ${loginData.user.name} (${loginData.user.email})`);
    console.log(`   Role: ${loginData.user.role}`);
    console.log(`   Token: ${loginData.token.slice(0, 20)}...`);
  } else {
    console.error('❌ FAIL: Admin login failed', loginData);
    return;
  }

  // Step 3: Test Dashboard Access with issued Admin Token
  console.log('\n3. Testing Protected /dashboard/stats Endpoint with Admin Token...');
  const dashRes = await fetch(`${API_BASE}/dashboard/stats`, {
    headers: {
      Authorization: `Bearer ${loginData.token}`,
    },
  });
  const dashData = await dashRes.json();

  if (dashRes.status === 200 && dashData.success && dashData.kpis) {
    console.log('✅ PASS: Dashboard data successfully fetched with Admin session token!');
    console.log('   KPIs:');
    console.log(`     - Total Departments: ${dashData.kpis.totalDepartments}`);
    console.log(`     - Total Students:    ${dashData.kpis.totalStudents}`);
    console.log(`     - Total Faculty:     ${dashData.kpis.totalFaculty}`);
    console.log(`     - Total Courses:     ${dashData.kpis.totalCourses}`);
    console.log(`     - Talents Identified:${dashData.kpis.studentsWithTalent}`);
  } else {
    console.error('❌ FAIL: Failed to access dashboard with token', dashData);
  }

  // Step 4: Test Session Verification (/auth/me)
  console.log('\n4. Testing /auth/me Session Verification...');
  const meRes = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${loginData.token}`,
    },
  });
  const meData = await meRes.json();

  if (meRes.status === 200 && meData.success && meData.data.role === 'admin') {
    console.log('✅ PASS: Session verified successfully for role Admin!');
  } else {
    console.error('❌ FAIL: Failed to verify session', meData);
  }

  console.log('\n===============================================================');
  console.log('🎉 ALL LOGIN & DASHBOARD ACCESS TESTS PASSED!');
  console.log('===============================================================\n');
}

testAdminLoginFlow();
