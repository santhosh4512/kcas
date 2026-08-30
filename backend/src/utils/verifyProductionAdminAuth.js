const mongoose = require('mongoose');
const User = require('../models/User');
const ensureDefaultAdmin = require('../seed/ensureAdmin');
require('dotenv').config();

const API_BASE = 'http://localhost:5001/api';
const ADMIN_EMAIL = 'santhoshsiva754@gmail.com';
const ADMIN_PASS = '12345678';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('=================================================================');
  console.log('🧪 VERIFYING PRODUCTION ADMIN AUTHENTICATION & SESSION LIFECYCLE');
  console.log('=================================================================\n');

  try {
    // 1. Connect DB and run ensureDefaultAdmin
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kcas_department_db');
    const adminDoc = await ensureDefaultAdmin();
    assert(adminDoc && adminDoc.email === ADMIN_EMAIL, `Default Master Admin exists (${ADMIN_EMAIL})`);
    assert(adminDoc && (adminDoc.role === 'admin' || adminDoc.role === 'ADMIN'), `Admin role is confirmed: ${adminDoc.role}`);
    assert(adminDoc && adminDoc.status === 'Active', `Admin account is Active`);

    // Ensure only 1 document exists with this email (no duplicates)
    const adminCount = await User.countDocuments({ email: ADMIN_EMAIL });
    assert(adminCount === 1, `Exactly ONE Admin account exists for ${ADMIN_EMAIL} (no duplicates)`);

    // 2. Test Admin Login with valid credentials
    console.log('\n--- Testing Login Flow ---');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASS,
      }),
    });
    const loginData = await loginRes.json();

    assert(loginRes.status === 200 && loginData.success === true, 'Admin login returned HTTP 200 with success: true');
    assert(typeof loginData.token === 'string' && loginData.token.length > 20, 'Issued valid JWT token');
    assert(loginData.user.email === ADMIN_EMAIL, `User email matches ${ADMIN_EMAIL}`);
    assert(loginData.user.role.toLowerCase() === 'admin', `User role matches 'admin'`);

    const adminToken = loginData.token;

    // 3. Test Invalid Credentials
    console.log('\n--- Testing Invalid Credentials ---');
    const invalidRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: 'wrong_password_123',
      }),
    });
    const invalidData = await invalidRes.json();

    assert(
      invalidRes.status === 401 && invalidData.message.includes('Invalid credentials'),
      'Wrong password returned HTTP 401 with clear error message'
    );

    // 4. Test Session Persistence (/api/auth/me)
    console.log('\n--- Testing Session Persistence & Verification ---');
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const meData = await meRes.json();

    assert(meRes.status === 200 && meData.success === true, 'Session verified via /api/auth/me');
    assert(meData.data.email === ADMIN_EMAIL, `Session belongs to ${ADMIN_EMAIL}`);

    // 5. Test Unauthenticated Access to /api/auth/me
    const unauthRes = await fetch(`${API_BASE}/auth/me`);
    assert(unauthRes.status === 401, 'Unauthenticated request correctly rejected with HTTP 401');

    // 6. Test Protected Admin Management Route
    console.log('\n--- Testing Protected Admin Management Route ---');
    const adminsRes = await fetch(`${API_BASE}/admins`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminsData = await adminsRes.json();

    assert(adminsRes.status === 200 && Array.isArray(adminsData.data), 'Admin successfully accessed /api/admins');

    console.log('\n=================================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('=================================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err.message);
    process.exit(1);
  }
}

runTests();
