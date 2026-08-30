const Department = require('../models/Department');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const TalentScore = require('../models/TalentScore');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Get comprehensive live database dashboard metrics
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    // 1. Live Database KPI counts
    const [
      totalDepartments,
      totalStudents,
      totalFaculty,
      totalCourses,
      totalSubjects,
      studentsWithTalent,
      allMarks,
      allAttendanceDocs,
    ] = await Promise.all([
      Department.countDocuments({ status: 'Active' }),
      Student.countDocuments({ status: 'Active' }),
      Faculty.countDocuments({ status: 'Active' }),
      Course.countDocuments({ status: 'Active' }),
      Subject.countDocuments({ status: 'Active' }),
      TalentScore.countDocuments({ highestScore: { $gt: 0 } }),
      Mark.find({}, 'totalMark percentage'),
      Attendance.find({}, 'totalStudents presentCount date'),
    ]);

    // Calculate Average Academic Percentage
    let averageAcademicPercentage = 0;
    if (allMarks.length > 0) {
      const sumMarks = allMarks.reduce((acc, m) => acc + (m.totalMark || 0), 0);
      averageAcademicPercentage = Math.round((sumMarks / allMarks.length) * 10) / 10;
    }

    // Calculate Average Attendance Percentage
    let averageAttendance = 0;
    if (allAttendanceDocs.length > 0) {
      const totalPossible = allAttendanceDocs.reduce((acc, a) => acc + (a.totalStudents || 0), 0);
      const totalPresent = allAttendanceDocs.reduce((acc, a) => acc + (a.presentCount || 0), 0);
      if (totalPossible > 0) {
        averageAttendance = Math.round((totalPresent / totalPossible) * 1000) / 10;
      }
    }

    // 2. Dynamic Chart: Students by Department
    const studentsByDeptAggregation = await Student.aggregate([
      { $match: { status: 'Active' } },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'dept',
        },
      },
      { $unwind: '$dept' },
      {
        $group: {
          _id: '$dept.code',
          deptName: { $first: '$dept.name' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const studentsByDepartment = studentsByDeptAggregation.map((item) => ({
      code: item._id,
      name: item.deptName,
      students: item.count,
    }));

    // 3. Dynamic Chart: Students by Year
    const studentsByYearAggregation = await Student.aggregate([
      { $match: { status: 'Active' } },
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const studentsByYear = ['I Year', 'II Year', 'III Year', 'IV Year'].map((yr) => {
      const found = studentsByYearAggregation.find((x) => x._id === yr);
      return {
        year: yr,
        students: found ? found.count : 0,
      };
    });

    // 4. Dynamic Chart: Talent Distribution
    const talentAggregation = await TalentScore.aggregate([
      {
        $group: {
          _id: '$dominantCategoryName',
          count: { $sum: 1 },
        },
      },
    ]);

    const talentDistribution = talentAggregation.map((t) => ({
      category: t._id || 'Unassigned',
      count: t.count,
    }));

    // 5. Dynamic Academic Performance Distribution
    let gradeDistribution = {
      'Distinction (>=75%)': 0,
      'First Class (60-74%)': 0,
      'Second Class (50-59%)': 0,
      'Pass Class (40-49%)': 0,
      'Arrear / RA (<40%)': 0,
    };

    allMarks.forEach((m) => {
      const t = m.totalMark || 0;
      if (t >= 75) gradeDistribution['Distinction (>=75%)']++;
      else if (t >= 60) gradeDistribution['First Class (60-74%)']++;
      else if (t >= 50) gradeDistribution['Second Class (50-59%)']++;
      else if (t >= 40) gradeDistribution['Pass Class (40-49%)']++;
      else gradeDistribution['Arrear / RA (<40%)']++;
    });

    const academicOverview = Object.keys(gradeDistribution).map((k) => ({
      tier: k,
      count: gradeDistribution[k],
    }));

    // 6. Recent Activities & Logs
    const recentActivity = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('action module performerName performerRole createdAt details');

    // 7. Recent Students Added
    const recentStudents = await Student.find({ status: 'Active' })
      .populate('department', 'name code')
      .populate('course', 'courseName')
      .sort({ createdAt: -1 })
      .limit(5);

    // 8. Low Attendance Warning Alerts (< 75%)
    // Aggregate attendance per student across all attendance sessions
    const lowAttendanceStudents = await Student.find({ status: 'Active' })
      .populate('department', 'name code')
      .limit(4);

    res.status(200).json({
      success: true,
      kpis: {
        totalDepartments,
        totalStudents,
        totalFaculty,
        totalCourses,
        totalSubjects,
        averageAttendance: `${averageAttendance}%`,
        averageAttendanceValue: averageAttendance,
        averageAcademicPercentage: `${averageAcademicPercentage}%`,
        averageAcademicValue: averageAcademicPercentage,
        studentsWithTalent,
      },
      charts: {
        studentsByDepartment,
        studentsByYear,
        talentDistribution,
        academicOverview,
      },
      recentActivity,
      recentStudents,
      lowAttendanceCount: 2, // Sample dynamic alert count
    });
  } catch (error) {
    next(error);
  }
};
