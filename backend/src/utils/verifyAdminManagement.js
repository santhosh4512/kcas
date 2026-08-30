const API_BASE = 'http://localhost:5001/api';

async function runAdminTests() {
  console.log('🚀 Starting Admin Management & Security Test Suite...');
  let passed = 0;
  let failed = 0;

  try {
    // 1. Admin Login
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'santhoshsiva754@gmail.com',
        password: '12345678',
      }),
    });
    const adminLoginData = await adminLoginRes.json();

    if (adminLoginData.success && adminLoginData.token) {
      console.log('✅ 1. Master Admin Login Successful');
      passed++;
    } else {
      console.error('❌ 1. Master Admin Login Failed', adminLoginData);
      failed++;
    }

    const adminToken = adminLoginData.token;
    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };

    // 2. Fetch all Admins
    const getAdminsRes = await fetch(`${API_BASE}/admins`, { headers: adminHeaders });
    const getAdminsData = await getAdminsRes.json();

    if (getAdminsData.success && Array.isArray(getAdminsData.data)) {
      console.log(`✅ 2. GET /api/admins returned ${getAdminsData.count} admin(s)`);
      passed++;
    } else {
      console.error('❌ 2. GET /api/admins Failed', getAdminsData);
      failed++;
    }

    // 3. Create a New Admin
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const testAdminEmail = `admin_test_${randomId}@kcas.edu.in`;
    const createRes = await fetch(`${API_BASE}/admins`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Dr. R. Malathi',
        email: testAdminEmail,
        phone: '9488029091',
        password: 'AdminPassword@123',
        confirmPassword: 'AdminPassword@123',
        designation: 'Associate Dean of Academics',
        status: 'Active',
      }),
    });
    const createData = await createRes.json();

    let createdAdminId = '';
    if (createData.success && createData.data.role === 'admin') {
      createdAdminId = createData.data._id;
      console.log(`✅ 3. POST /api/admins Created Admin (Role: ${createData.data.role}, ID: ${createdAdminId})`);
      passed++;
    } else {
      console.error('❌ 3. POST /api/admins Creation Failed', createData);
      failed++;
    }

    // 4. Update Admin Profile
    const updateRes = await fetch(`${API_BASE}/admins/${createdAdminId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Dr. R. Malathi (Senior Dean)',
        designation: 'Dean of Academic Affairs',
      }),
    });
    const updateData = await updateRes.json();

    if (updateData.success && updateData.data.name.includes('Senior Dean')) {
      console.log('✅ 4. PUT /api/admins/:id Updated Admin Details');
      passed++;
    } else {
      console.error('❌ 4. PUT /api/admins/:id Update Failed', updateData);
      failed++;
    }

    // 5. Change Admin Password
    const passRes = await fetch(`${API_BASE}/admins/${createdAdminId}/password`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        password: 'NewAdminPassword@2026',
        confirmPassword: 'NewAdminPassword@2026',
      }),
    });
    const passData = await passRes.json();

    if (passData.success) {
      console.log('✅ 5. PUT /api/admins/:id/password Password Updated');
      passed++;
    } else {
      console.error('❌ 5. PUT /api/admins/:id/password Failed', passData);
      failed++;
    }

    // 6. Toggle Admin Status
    const toggleRes = await fetch(`${API_BASE}/admins/${createdAdminId}/toggle-status`, {
      method: 'PATCH',
      headers: adminHeaders,
    });
    const toggleData = await toggleRes.json();

    if (toggleData.success && toggleData.status === 'Inactive') {
      console.log('✅ 6. PATCH /api/admins/:id/toggle-status Toggled to Inactive');
      passed++;
    } else {
      console.error('❌ 6. PATCH /api/admins/:id/toggle-status Failed', toggleData);
      failed++;
    }

    // 7. Test Non-Admin Rejection (Simulate student registration and attempt to access /api/admins)
    const publicRegEmail = `student_tester_${randomId}@gmail.com`;
    const regRes = await fetch(`${API_BASE}/auth/register-public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: publicRegEmail,
        password: 'Password@123',
      }),
    });
    const regData = await regRes.json();
    const studentToken = regData.token;

    const studentAttemptRes = await fetch(`${API_BASE}/admins`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
    });
    const studentAttemptData = await studentAttemptRes.json();

    if (studentAttemptRes.status === 403) {
      console.log('✅ 7. Non-Admin User Blocked from /api/admins (HTTP 403 Forbidden)');
      passed++;
    } else {
      console.error('❌ 7. Non-Admin Security Protection Failed', studentAttemptData);
      failed++;
    }

    // 8. Test Master Admin Protection (Cannot delete master admin)
    const masterAdmin = getAdminsData.data.find((a) => a.email === 'santhoshsiva754@gmail.com');
    const deleteMasterRes = await fetch(`${API_BASE}/admins/${masterAdmin._id}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    const deleteMasterData = await deleteMasterRes.json();

    if (deleteMasterRes.status === 400 && !deleteMasterData.success) {
      console.log('✅ 8. Master Primary Admin Protected from Deletion');
      passed++;
    } else {
      console.error('❌ 8. Master Admin Protection Failed', deleteMasterData);
      failed++;
    }

    // 9. Delete Test Admin
    const deleteTestRes = await fetch(`${API_BASE}/admins/${createdAdminId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    const deleteTestData = await deleteTestRes.json();

    if (deleteTestData.success) {
      console.log('✅ 9. DELETE /api/admins/:id Deleted Test Admin Successfully');
      passed++;
    } else {
      console.error('❌ 9. DELETE /api/admins/:id Failed', deleteTestData);
      failed++;
    }

    console.log(`\n🎉 Admin Management Test Results: ${passed} PASSED, ${failed} FAILED\n`);
  } catch (err) {
    console.error('❌ Unexpected test error:', err);
  }
}

runAdminTests();
