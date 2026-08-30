const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const TalentScore = require('../models/TalentScore');
const Department = require('../models/Department');
const Course = require('../models/Course');

/**
 * @desc    Generate tabular data for various system reports
 * @route   GET /api/reports/:reportType
 * @access  Private
 */
exports.getReportData = async (req, res, next) => {
  try {
    const { reportType } = req.params;
    const { department, course, year, semester, section, search } = req.query;

    const filter = {};
    if (department && department !== 'All') filter.department = department;
    if (course && course !== 'All') filter.course = course;
    if (year && year !== 'All') filter.year = year;
    if (semester && semester !== 'All') filter.semester = semester;
    if (section && section !== 'All') filter.section = section;

    let results = [];
    let reportTitle = 'System Report';
    let headers = [];

    switch (reportType) {
      case 'students':
        reportTitle = 'KCAS - Student Comprehensive Directory Report';
        headers = ['Register No', 'Roll No', 'Student Name', 'Department', 'Course', 'Year', 'Phone', 'Status'];
        const studentDocs = await Student.find(filter)
          .populate('department', 'name code')
          .populate('course', 'courseName')
          .sort({ registerNumber: 1 });
        results = studentDocs.map((s) => ({
          registerNumber: s.registerNumber,
          rollNumber: s.rollNumber,
          name: s.name,
          department: s.department ? s.department.name : '',
          course: s.course ? s.course.courseName : '',
          year: s.year,
          phone: s.phone,
          status: s.status,
        }));
        break;

      case 'faculty':
        reportTitle = 'KCAS - Faculty Staff Directory Report';
        headers = ['Employee ID', 'Faculty Name', 'Department', 'Designation', 'Qualification', 'Email', 'Experience', 'Status'];
        const facFilter = {};
        if (department && department !== 'All') facFilter.department = department;
        const facultyDocs = await Faculty.find(facFilter)
          .populate('department', 'name code')
          .sort({ employeeId: 1 });
        results = facultyDocs.map((f) => ({
          employeeId: f.employeeId,
          name: f.name,
          department: f.department ? f.department.name : '',
          designation: f.designation,
          qualification: f.qualification,
          email: f.email,
          experience: f.experience,
          status: f.status,
        }));
        break;

      case 'attendance':
        reportTitle = 'KCAS - Student Attendance & Shortage Analysis Report';
        headers = ['Register No', 'Student Name', 'Department', 'Course', 'Year', 'Total Sessions', 'Present Count', 'Attendance %', 'Status'];
        const allStudents = await Student.find(filter).populate('department', 'name').populate('course', 'courseName');
        const attendanceRecords = await Attendance.find(filter);
        results = allStudents.map((st) => {
          let pres = 0;
          let total = 0;
          attendanceRecords.forEach((att) => {
            const found = att.records.find((r) => String(r.student) === String(st._id));
            if (found) {
              total++;
              if (found.status === 'Present' || found.status === 'On Duty') pres++;
            }
          });
          const pct = total > 0 ? Math.round((pres / total) * 1000) / 10 : 100;
          return {
            registerNumber: st.registerNumber,
            name: st.name,
            department: st.department ? st.department.name : '',
            course: st.course ? st.course.courseName : '',
            year: st.year,
            totalSessions: total,
            presentCount: pres,
            attendancePercentage: `${pct}%`,
            status: pct >= 75 ? 'Eligible (Healthy)' : pct >= 65 ? 'Condonation (Warning)' : 'Shortage (Low)',
          };
        });
        break;

      case 'marks':
      case 'results':
        reportTitle = 'KCAS - Academic Performance & Semester Results Report';
        headers = ['Register No', 'Student Name', 'Subject Code', 'Subject Name', 'Internal (25)', 'External (75)', 'Total (100)', 'Grade', 'Result'];
        const marksDocs = await Mark.find(filter)
          .populate('department', 'name')
          .populate('subject', 'subjectCode subjectName')
          .sort({ registerNumber: 1, subjectCode: 1 });
        results = marksDocs.map((m) => ({
          registerNumber: m.registerNumber,
          name: m.studentName,
          subjectCode: m.subjectCode,
          subjectName: m.subjectName,
          internalMark: m.internalMark,
          externalMark: m.externalMark,
          totalMark: m.totalMark,
          grade: m.grade,
          resultStatus: m.resultStatus,
        }));
        break;

      case 'talent':
      case 'individual-talent':
        reportTitle = 'KCAS - Student Skill & Talent Intelligence Registry Report';
        headers = ['Register No', 'Student Name', 'Department', 'Primary Talent', 'Top Score', 'Secondary Strength', 'Joint Tied?', 'Talent Summary'];
        const talentDocs = await TalentScore.find(filter)
          .populate('department', 'name code')
          .populate('course', 'courseName')
          .sort({ highestScore: -1 });
        results = talentDocs.map((t) => ({
          registerNumber: t.registerNumber,
          name: t.studentName,
          department: t.department ? t.department.name : '',
          primaryTalent: t.primaryTalent.map((p) => p.displayName).join(', '),
          highestScore: `${t.highestScore}%`,
          secondaryStrength: t.secondaryStrength.map((s) => s.displayName).join(', ') || 'None',
          isJointHighest: t.isJointHighest ? 'Yes (Tied)' : 'No',
          calculatedSummary: t.calculatedSummary,
        }));
        break;

      case 'department-talent':
        reportTitle = 'KCAS - Department Talent Intelligence Aggregate Report';
        headers = ['Category', 'Students Count', 'Percentage Distribution', 'Dominant Status'];
        const allTalents = await TalentScore.find(filter);
        const counts = { Studies: 0, Sports: 0, 'Arts & Culture': 0, 'Technical Skills': 0, Communication: 0, Leadership: 0, 'Other Skills': 0 };
        allTalents.forEach((t) => {
          if (t.primaryTalent && t.primaryTalent[0]) {
            const dn = t.primaryTalent[0].displayName;
            if (counts[dn] !== undefined) counts[dn]++;
            else counts['Other Skills']++;
          }
        });
        const totalT = allTalents.length || 1;
        results = Object.keys(counts).map((cat) => ({
          category: cat,
          studentCount: counts[cat],
          percentage: `${Math.round((counts[cat] / totalT) * 1000) / 10}%`,
          dominantStatus: counts[cat] === Math.max(...Object.values(counts)) && counts[cat] > 0 ? '🏆 Dominant Field' : 'Secondary',
        }));
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid report type requested.' });
    }

    // Apply optional search filter on tabular rows
    if (search) {
      const s = search.toLowerCase();
      results = results.filter((row) =>
        Object.values(row).some((val) => String(val).toLowerCase().includes(s))
      );
    }

    res.status(200).json({
      success: true,
      reportType,
      title: reportTitle,
      generatedAt: new Date().toISOString(),
      institution: 'Kamban College of Arts and Science for Women, Tiruvannamalai',
      headers,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
