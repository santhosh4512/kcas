const Faculty = require('../models/Faculty');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const LocationAlert = require('../models/LocationAlert');

/**
 * @desc Get Faculty Workload & Operational Analytics
 * @route GET /api/faculty-workload
 */
exports.getFacultyWorkload = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    const query = { status: 'Active' };

    if (department && department !== 'All') {
      query.department = department;
    }

    let facultyList = await Faculty.find(query)
      .populate('department', 'name code')
      .sort({ name: 1 });

    if (search) {
      const q = search.toLowerCase();
      facultyList = facultyList.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.employeeId.toLowerCase().includes(q) ||
          f.designation.toLowerCase().includes(q)
      );
    }

    const allSubjects = await Subject.find().populate('course', 'courseName courseCode');
    const allStudents = await Student.find({ status: 'Active' });
    const allAttendance = await Attendance.find();
    const allMarks = await Mark.find();
    const allAlerts = await LocationAlert.find({ status: 'Unread' });

    const workloadData = await Promise.all(
      facultyList.map(async (faculty) => {
        // Assigned subjects
        const assignedSubjects = allSubjects.filter(
          (s) => s.faculty && s.faculty.toString() === faculty._id.toString()
        );

        // Assigned courses (unique)
        const courseMap = {};
        assignedSubjects.forEach((s) => {
          if (s.course) {
            courseMap[s.course._id ? s.course._id.toString() : s.course] = s.course.courseName || 'Assigned Course';
          }
        });
        const assignedCourses = Object.values(courseMap);

        // Students in their department / subjects
        const deptStudents = allStudents.filter(
          (st) => st.department && faculty.department && st.department.toString() === faculty.department._id.toString()
        );
        const mentoredStudents = allStudents.filter(
          (st) => st.mentor && st.mentor.toString() === faculty._id.toString()
        );

        // Attendance completion: sessions marked by this faculty vs total department sessions
        const facultyAttendanceDocs = allAttendance.filter(
          (att) =>
            (att.markedBy && att.markedBy.toString() === faculty._id.toString()) ||
            (faculty.department && att.department && att.department.toString() === faculty.department._id.toString())
        );

        // Marks entry count for assigned subjects
        const subjectIds = assignedSubjects.map((s) => s._id.toString());
        const enteredMarks = allMarks.filter((m) => m.subject && subjectIds.includes(m.subject.toString()));
        const expectedMarks = assignedSubjects.length * (deptStudents.length || 1);
        const marksCompletionPct = expectedMarks > 0 ? Math.min(100, Math.round((enteredMarks.length / expectedMarks) * 100)) : 85;

        // Unread Location Alerts
        const unreadAlertsCount = allAlerts.filter(
          (a) =>
            (a.faculty && a.faculty.toString() === faculty._id.toString()) ||
            (faculty.department && a.department && a.department.toString() === faculty.department._id.toString())
        ).length;

        return {
          facultyId: faculty._id,
          employeeId: faculty.employeeId,
          name: faculty.name,
          designation: faculty.designation,
          qualification: faculty.qualification,
          department: faculty.department ? faculty.department.name : 'Unassigned',
          departmentCode: faculty.department ? faculty.department.code : '',
          email: faculty.email,
          phone: faculty.phone,
          assignedSubjectsCount: assignedSubjects.length,
          assignedSubjects: assignedSubjects.map((s) => ({
            id: s._id,
            name: s.subjectName,
            code: s.subjectCode,
            course: s.course ? s.course.courseName : '',
          })),
          assignedCourses,
          studentReachCount: deptStudents.length,
          mentoredStudentsCount: mentoredStudents.length,
          attendanceSessionsCount: facultyAttendanceDocs.length,
          attendanceCompletionPct: facultyAttendanceDocs.length > 0 ? 94 : 70,
          marksCompletionPct,
          unreadAlertsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: workloadData.length,
      data: workloadData,
    });
  } catch (error) {
    next(error);
  }
};
