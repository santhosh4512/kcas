const TalentScore = require('../models/TalentScore');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Student = require('../models/Student');
const talentService = require('../services/talentService');

/**
 * @desc    Get Department Talent Analytics for selected cohort
 * @route   GET /api/talent/analytics
 * @access  Private
 */
exports.getDepartmentTalentAnalytics = async (req, res, next) => {
  try {
    const { department, course, year, semester, section, category } = req.query;

    const query = {};

    if (department && department !== 'All') query.department = department;
    if (course && course !== 'All') query.course = course;
    if (year && year !== 'All') query.year = year;
    if (semester && semester !== 'All') query.semester = semester;
    if (section && section !== 'All') query.section = section;

    // Optional category highlight filter
    if (category && category !== 'All') {
      const categoryKey = category.toLowerCase().replace(/[^a-z]/g, '');
      if (categoryKey.includes('sport')) query['categoryScores.sports'] = { $gte: 70 };
      else if (categoryKey.includes('tech')) query['categoryScores.technical'] = { $gte: 70 };
      else if (categoryKey.includes('art')) query['categoryScores.arts'] = { $gte: 70 };
      else if (categoryKey.includes('comm')) query['categoryScores.communication'] = { $gte: 70 };
      else if (categoryKey.includes('lead')) query['categoryScores.leadership'] = { $gte: 70 };
      else if (categoryKey.includes('stud')) query['categoryScores.studies'] = { $gte: 70 };
    }

    const talentDocs = await TalentScore.find(query)
      .populate('department', 'name code')
      .populate('course', 'courseName')
      .populate('student', 'name rollNumber photoUrl');

    let deptName = 'All Departments';
    if (department && department !== 'All') {
      const d = await Department.findById(department);
      if (d) deptName = `${d.name} (${d.code})`;
    }

    // Run backend calculation engine for group aggregation
    const analytics = talentService.calculateDepartmentAnalytics(talentDocs, {
      deptName,
      year: year && year !== 'All' ? year : '',
    });

    // Top students list for current filter
    const topStudents = talentDocs
      .slice(0)
      .sort((a, b) => b.highestScore - a.highestScore)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      appliedFilters: {
        department: department || 'All',
        course: course || 'All',
        year: year || 'All',
        semester: semester || 'All',
        section: section || 'All',
      },
      analytics,
      topStudents,
      rawCount: talentDocs.length,
    });
  } catch (error) {
    next(error);
  }
};
