const TalentScore = require('../models/TalentScore');
const Student = require('../models/Student');
const Skill = require('../models/Skill');
const Department = require('../models/Department');
const Course = require('../models/Course');
const talentService = require('../services/talentService');

/**
 * @desc    Get all student talent scores with filtering and quick filters
 * @route   GET /api/talent
 * @access  Private
 */
exports.getTalentList = async (req, res, next) => {
  try {
    const {
      department,
      course,
      year,
      semester,
      section,
      quickFilter,
      search,
      page = 1,
      limit = 25,
    } = req.query;

    const query = {};

    if (department && department !== 'All') query.department = department;
    if (course && course !== 'All') query.course = course;
    if (year && year !== 'All') query.year = year;
    if (semester && semester !== 'All') query.semester = semester;
    if (section && section !== 'All') query.section = section;

    // Quick Filter support
    if (quickFilter && quickFilter !== 'All') {
      if (quickFilter === 'Top Academic') {
        query['categoryScores.studies'] = { $gte: 75 };
      } else if (quickFilter === 'Top Sports') {
        query['categoryScores.sports'] = { $gte: 75 };
      } else if (quickFilter === 'Top Technical') {
        query['categoryScores.technical'] = { $gte: 75 };
      } else if (quickFilter === 'Top Arts') {
        query['categoryScores.arts'] = { $gte: 75 };
      } else if (quickFilter === 'Top Communication') {
        query['categoryScores.communication'] = { $gte: 75 };
      } else if (quickFilter === 'Top Leadership') {
        query['categoryScores.leadership'] = { $gte: 75 };
      } else if (quickFilter === 'Joint Strengths') {
        query.isJointHighest = true;
      }
    }

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { registerNumber: { $regex: search, $options: 'i' } },
        { dominantCategoryName: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await TalentScore.countDocuments(query);
    const talents = await TalentScore.find(query)
      .populate('department', 'name code')
      .populate('course', 'courseName')
      .populate('student', 'rollNumber photoUrl email phone')
      .sort({ highestScore: -1, studentName: 1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: talents.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: talents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed talent profile of a single student (Scores, Radar breakdown, Skills, Achievements)
 * @route   GET /api/talent/student/:studentId
 * @access  Private
 */
exports.getStudentTalentProfile = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.studentId)
      .populate('department', 'name code')
      .populate('course', 'courseName courseCode');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    let talent = await TalentScore.findOne({ student: student._id });

    if (!talent) {
      // Auto-initialize talent profile if not already present
      const calculated = talentService.calculateTalentScores({}, student.name);
      talent = await TalentScore.create({
        student: student._id,
        registerNumber: student.registerNumber,
        studentName: student.name,
        department: student.department._id,
        course: student.course._id,
        year: student.year,
        semester: student.semester,
        section: student.section,
        ...calculated,
      });
    }

    const skills = await Skill.find({ student: student._id }).sort({ percentage: -1 });

    res.status(200).json({
      success: true,
      data: {
        student,
        talent,
        skills,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save / Update student category talent scores and run deterministic talent calculation
 * @route   POST /api/talent/evaluate
 * @access  Private/Faculty/Admin
 */
exports.evaluateStudentTalent = async (req, res, next) => {
  try {
    const { studentId, categoryScores, evaluatorNotes } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Execute Deterministic Backend Talent Calculation Engine
    const calculated = talentService.calculateTalentScores(categoryScores, student.name);

    let talent = await TalentScore.findOne({ student: student._id });

    if (talent) {
      talent.categoryScores = calculated.categoryScores;
      talent.rankedCategories = calculated.rankedCategories;
      talent.primaryTalent = calculated.primaryTalent;
      talent.secondaryStrength = calculated.secondaryStrength;
      talent.highestScore = calculated.highestScore;
      talent.dominantCategoryName = calculated.dominantCategoryName;
      talent.isJointHighest = calculated.isJointHighest;
      talent.calculatedSummary = calculated.calculatedSummary;
      talent.evaluatorNotes = evaluatorNotes || talent.evaluatorNotes;
      talent.evaluatedBy = req.user._id;
      await talent.save();
    } else {
      talent = await TalentScore.create({
        student: student._id,
        registerNumber: student.registerNumber,
        studentName: student.name,
        department: student.department,
        course: student.course,
        year: student.year,
        semester: student.semester,
        section: student.section,
        evaluatorNotes: evaluatorNotes || '',
        evaluatedBy: req.user._id,
        ...calculated,
      });
    }

    const populated = await TalentScore.findById(talent._id)
      .populate('department', 'name code')
      .populate('course', 'courseName');

    res.status(200).json({
      success: true,
      message: 'Student talent profile evaluated and calculated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add specific skill/achievement for student
 * @route   POST /api/talent/skill
 * @access  Private/Faculty/Admin
 */
exports.addSkill = async (req, res, next) => {
  try {
    const {
      studentId,
      skillName,
      category,
      skillLevel,
      percentage,
      experience,
      achievement,
      certificate,
      passion,
    } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const skill = await Skill.create({
      student: student._id,
      registerNumber: student.registerNumber,
      skillName: skillName.trim(),
      category: category || 'Technical Skills',
      skillLevel: skillLevel || 'Intermediate',
      percentage: Number(percentage) || 75,
      experience: experience || '1 Year',
      achievement: achievement || '',
      certificate: certificate || '',
      passion: passion || '',
    });

    res.status(201).json({
      success: true,
      message: 'Skill added successfully',
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete specific skill
 * @route   DELETE /api/talent/skill/:id
 * @access  Private/Faculty/Admin
 */
exports.deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill record not found' });
    }

    await Skill.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Skill record deleted' });
  } catch (error) {
    next(error);
  }
};
