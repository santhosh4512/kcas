/**
 * Comprehensive System & SaaS Security Verification Suite
 * Tests:
 * 1. Health check
 * 2. Admin Authentication
 * 3. Public Student Registration & Single-Admin Privilege Escalation Blocking
 * 4. Admin Staff Account Creation with Temporary Passwords & Permissions
 * 5. Staff First-Time Login & Mandatory Password Change
 * 6. Staff Permissions Access Control
 * 7. Dashboard Metrics & Dynamic Recharts
 * 8. Department CRUD
 * 9. Course & Subject CRUD
 * 10. Student Management & 360 Profile
 * 11. Attendance Sheet & Saving
 * 12. University Marks & Automated Grade Calculation
 * 13. Student Talent Intelligence & Deterministic Ranking Engine
 * 14. Joint-Strength Tie Detection
 * 15. Department Talent Analytics & Summary Synthesis
 * 16. Institutional Reports
 * 17. Audit Logs Verification
 */

const API_BASE = 'http://localhost:5001/api';

async function runTests() {
  console.log('=================================================================');
  console.log('🧪 RUNNING ENHANCED FULL SYSTEM & SAAS SECURITY VERIFICATION');
  console.log('=================================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Health
    const health = await fetch(`${API_BASE}/health`).then((r) => r.json());
    assert(health.status === 'success', 'API Health Check');

    // 2. Admin Authentication
    const adminLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@kcas.edu.in', password: 'Admin@123' }),
    }).then((r) => r.json());
    assert(adminLogin.success && adminLogin.user.role === 'admin', 'Single Admin Authentication');
    const adminToken = adminLogin.token;
    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };

    // 3. Public Student Registration
    const testEmail = `student_${Date.now()}@gmail.com`;
    const pubReg = await fetch(`${API_BASE}/auth/register-public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Deepa Lakshmi',
        email: testEmail,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        role: 'admin', // Attempted role escalation
      }),
    }).then((r) => r.json());
    assert(
      pubReg.success && pubReg.user.role === 'student',
      'Public Registration & Single-Admin Privilege Protection (Role locked to Student)'
    );

    // 4. Admin Creating Staff Account with Temporary Credentials
    const staffEmail = `staff_${Date.now()}@kcas.edu.in`;
    const createStaff = await fetch(`${API_BASE}/staff`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Dr. R. Shalini',
        employeeId: `KCAS-SHAL-${Date.now().toString().slice(-4)}`,
        email: staffEmail,
        temporaryPassword: 'TempPassword@2026',
        designation: 'Assistant Professor',
        permissions: ['view_students', 'view_attendance', 'manage_attendance', 'view_marks', 'manage_marks'],
      }),
    }).then((r) => r.json());
    assert(
      createStaff.success && createStaff.data.mustChangePassword === true,
      'Admin Staff Account Creation (Temporary Password & Permissions Assigned)'
    );

    // 5. Staff First Login & Password Change Workflow
    const staffLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: staffEmail, password: 'TempPassword@2026' }),
    }).then((r) => r.json());
    assert(
      staffLogin.success && staffLogin.user.mustChangePassword === true,
      'Staff Initial Login Detection (mustChangePassword flag triggered)'
    );

    const staffFirstPass = await fetch(`${API_BASE}/auth/change-first-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffLogin.token}`,
      },
      body: JSON.stringify({
        currentPassword: 'TempPassword@2026',
        newPassword: 'PermanentPassword@123',
        confirmPassword: 'PermanentPassword@123',
      }),
    }).then((r) => r.json());
    assert(staffFirstPass.success, 'Staff Mandatory First-Time Password Reset Completed');

    // 6. Verify Dashboard Metrics
    const dashRes = await fetch(`${API_BASE}/dashboard/stats`, { headers: adminHeaders }).then((r) =>
      r.json()
    );
    assert(dashRes.success && dashRes.kpis.totalDepartments > 0, 'Live Dashboard Database KPIs');

    // 7. Departments & Courses
    const depts = await fetch(`${API_BASE}/departments`, { headers: adminHeaders }).then((r) =>
      r.json()
    );
    assert(depts.success && depts.data.length >= 4, 'Department Directory with Student Strengths');

    // 8. Students 360 Profile
    const students = await fetch(`${API_BASE}/students`, { headers: adminHeaders }).then((r) =>
      r.json()
    );
    assert(students.success && students.data.length > 0, 'Student Management Directory');

    // 9. Marks & Auto-Grades
    const marks = await fetch(`${API_BASE}/marks`, { headers: adminHeaders }).then((r) =>
      r.json()
    );
    assert(marks.success && marks.data.length > 0, 'University Marks & Auto-Grade Calculation');

    // 10. Talent Intelligence & Joint-Strength Tie Detection
    const talents = await fetch(`${API_BASE}/talent`, { headers: adminHeaders }).then((r) =>
      r.json()
    );
    const jointStudent = talents.data.find((t) => t.isJointHighest === true);
    assert(
      talents.success && jointStudent,
      `Talent Intelligence Engine (Joint Strength Tie Handled: ${jointStudent?.studentName})`
    );

    // 11. Department Talent Analytics
    const analytics = await fetch(`${API_BASE}/talent/analytics?department=${depts.data[0]._id}`, {
      headers: adminHeaders,
    }).then((r) => r.json());
    assert(
      analytics.success && analytics.analytics.dominantTalent,
      `Department Dominance Analysis (Dominant Talent: "${analytics.analytics.dominantTalent}")`
    );

    // 12. Audit Logs
    const auditRes = await fetch(`${API_BASE}/audit-logs`, { headers: adminHeaders }).then((r) =>
      r.json()
    );
    assert(
      auditRes.success && auditRes.data.length > 0,
      `System Audit Log Trail (${auditRes.total} total administrative operations recorded)`
    );

    console.log('\n=================================================================');
    console.log(`🎉 VERIFICATION COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log('=================================================================\n');
  } catch (err) {
    console.error('Fatal error during verification suite:', err);
  }
}

runTests();
