const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5001/api';

async function runPhotoTests() {
  console.log('🚀 Starting Profile Photo Verification Suite...');
  let passed = 0;
  let failed = 0;

  try {
    // 1. Admin Login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'santhoshsiva754@gmail.com',
        password: '12345678',
      }),
    });
    const loginData = await loginRes.json();
    
    if (loginData.success && loginData.token) {
      console.log('✅ 1. Admin Login Successful');
      passed++;
    } else {
      console.error('❌ 1. Admin Login Failed', loginData);
      failed++;
    }

    const token = loginData.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 2. Upload a sample image file using multipart form-data
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ]);
    const blob = new Blob([pngHeader], { type: 'image/png' });
    const formData = new FormData();
    formData.append('photo', blob, 'sample_avatar.png');

    const uploadRes = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const uploadData = await uploadRes.json();

    let uploadedUrl = '';
    if (uploadData.success && uploadData.url) {
      uploadedUrl = uploadData.url;
      console.log(`✅ 2. Image Uploaded Successfully -> ${uploadedUrl}`);
      passed++;
    } else {
      console.error('❌ 2. Image Upload Failed', uploadData);
      failed++;
    }

    // 3. Test Static File Serving
    const staticRes = await fetch(`http://localhost:5001${uploadedUrl}`);
    if (staticRes.status === 200) {
      console.log('✅ 3. Static Profile Photo Served via /uploads Endpoint');
      passed++;
    } else {
      console.error('❌ 3. Static Profile Photo Serving Failed');
      failed++;
    }

    // 4. Update Admin Profile Photo
    const profileRes = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Santhosh Siva S',
        designation: 'Chief Administrator & Systems Head',
        profilePhoto: uploadedUrl,
      }),
    });
    const profileData = await profileRes.json();

    if (
      profileData.success &&
      profileData.user.profilePhoto === uploadedUrl
    ) {
      console.log('✅ 4. Admin Profile Photo Updated & Persisted');
      passed++;
    } else {
      console.error('❌ 4. Admin Profile Photo Update Failed', profileData);
      failed++;
    }

    // 5. Test Faculty Creation with Profile Photo
    const deptsRes = await fetch(`${API_BASE}/departments`, { headers: authHeaders });
    const deptsData = await deptsRes.json();
    const deptId = deptsData.data[0]?._id;

    const facultyCode = `EMP${Math.floor(1000 + Math.random() * 9000)}`;
    const facRes = await fetch(`${API_BASE}/faculty`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        employeeId: facultyCode,
        name: 'Dr. S. Meenakshi',
        qualification: 'M.Sc., M.Phil., Ph.D.',
        designation: 'Associate Professor',
        department: deptId,
        email: `meenakshi_${facultyCode.toLowerCase()}@kcas.edu.in`,
        phone: '9840912345',
        experience: '8 Years',
        specialization: 'Artificial Intelligence',
        profilePhoto: uploadedUrl,
      }),
    });
    const facData = await facRes.json();

    if (facData.success && facData.data.profilePhoto === uploadedUrl) {
      console.log('✅ 5. Faculty Profile Created with Photo URL');
      passed++;
    } else {
      console.error('❌ 5. Faculty Profile Photo Creation Failed', facData);
      failed++;
    }

    console.log(`\n🎉 Verification Summary: ${passed} PASSED, ${failed} FAILED`);
  } catch (err) {
    console.error('❌ Unexpected test failure:', err);
  }
}

runPhotoTests();
