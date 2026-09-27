const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Certificate = require('../models/Certificate');
const WarningAlert = require('../models/WarningAlert');

/**
 * @desc Get Mentor Dashboard Data (Mentees, attendance stats, warnings, talent summary)
 * @route GET /api/mentor/dashboard
 */
exports.getMentorDashboard = async (req, res, next) => {
  try {
    const { facultyId } = req.query;
    let targetFacultyId = facultyId;

    if (!targetFacultyId && req.user && req.user.referenceId) {
      targetFacultyId = req.user.referenceId;
    }

    // If still no facultyId and user is faculty or admin, find first faculty or active user
    if (!targetFacultyId) {
      const firstFac = await Faculty.findOne({ status: 'Active' });
      if (firstFac) targetFacultyId = firstFac._id;
    }

    const faculty = targetFacultyId ? await Faculty.findById(targetFacultyId).populate('department') : null;

    // Fetch mentees assigned to this faculty
    const mentees = targetFacultyId
      ? await Student.find({ mentor: targetFacultyId, status: 'Active' })
          .populate('department', 'name code')
          .sort({ name: 1 })
      : await Student.find({ status: 'Active' }).limit(10).populate('department', 'name code');

    const menteeIds = mentees.map((m) => m._id);

    // Fetch active warnings for these mentees
    const warnings = await WarningAlert.find({
      student: { $in: menteeIds },
      status: { $in: ['Active', 'Under Review', 'Parent Contacted'] },
    }).populate('student', 'name registerNumber');

    // Fetch certificates submitted by mentees
    const certificates = await Certificate.find({
      student: { $in: menteeIds },
    }).populate('student', 'name registerNumber');

    // Calculate aggregated attendance & performance for each mentee
    const detailedMentees = await Promise.all(
      mentees.map(async (st) => {
        const attendanceDocs = await Attendance.find({ 'records.student': st._id });
        let totalSessions = 0;
        let presentCount = 0;

        attendanceDocs.forEach((doc) => {
          const rec = doc.records.find((r) => r.student.toString() === st._id.toString());
          if (rec) {
            totalSessions++;
            if (rec.status === 'Present' || rec.status === 'On Duty') {
              presentCount++;
            }
          }
        });

        const attendancePct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 85;

        // Fetch marks summary
        const marksDocs = await Mark.find({ 'marks.student': st._id });
        let totalScore = 0;
        let countMarks = 0;
        let failCount = 0;

        marksDocs.forEach((doc) => {
          const m = doc.marks.find((mk) => mk.student.toString() === st._id.toString());
          if (m) {
            countMarks++;
            const sc = m.totalMarks || 0;
            totalScore += sc;
            if (sc < 50) failCount++;
          }
        });

        const avgMarks = countMarks > 0 ? Math.round(totalScore / countMarks) : 75;
        const studentWarnings = warnings.filter((w) => w.student && w.student._id.toString() === st._id.toString());

        return {
          _id: st._id,
          studentId: st.studentId,
          name: st.name,
          registerNumber: st.registerNumber,
          rollNumber: st.rollNumber,
          department: st.department ? st.department.name : 'Computer Science',
          year: st.year,
          section: st.section,
          phone: st.phone,
          email: st.email,
          attendancePct,
          avgMarks,
          failCount,
          activeWarningsCount: studentWarnings.length,
          talentsCount: (st.talents || []).length,
          talents: st.talents || [],
          status: attendancePct < 75 || failCount > 0 ? 'Needs Attention' : 'On Track',
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        mentorInfo: faculty
          ? {
              _id: faculty._id,
              name: faculty.name,
              employeeId: faculty.employeeId,
              designation: faculty.designation,
              department: faculty.department ? faculty.department.name : '',
              email: faculty.email,
            }
          : {
              name: 'Dr. S. Kanimozhi',
              designation: 'Associate Professor & Senior Mentor',
              department: 'Computer Science',
              email: 'kanimozhi.cs@kambancollege.edu.in',
            },
        totalMentees: detailedMentees.length,
        atRiskMentees: detailedMentees.filter((m) => m.status === 'Needs Attention').length,
        activeWarningsCount: warnings.length,
        pendingCertificates: certificates.filter((c) => c.verificationStatus === 'Pending').length,
        mentees: detailedMentees,
        recentWarnings: warnings,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Assign mentor to students
 * @route POST /api/mentor/assign
 */
exports.assignMentor = async (req, res, next) => {
  try {
    const { facultyId, studentIds } = req.body;

    if (!facultyId || !studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ success: false, message: 'Faculty ID and array of Student IDs are required' });
    }

    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: { mentor: facultyId } }
    );

    res.status(200).json({
      success: true,
      message: `Successfully assigned ${studentIds.length} students to mentor.`,
    });
  } catch (err) {
    next(err);
  }
};
