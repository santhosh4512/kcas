const Subject = require('../models/Subject');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');

/**
 * @desc    Get subjects with filters
 * @route   GET /api/subjects
 * @access  Private
 */
exports.getSubjects = async (req, res, next) => {
  try {
    const { department, course, semester, search } = req.query;
    const query = {};

    if (department && department !== 'All') query.department = department;
    if (course && course !== 'All') query.course = course;
    if (semester && semester !== 'All') query.semester = semester;

    if (search) {
      query.$or = [
        { subjectName: { $regex: search, $options: 'i' } },
        { subjectCode: { $regex: search, $options: 'i' } },
      ];
    }

    const subjects = await Subject.find(query)
      .populate('department', 'name code')
      .populate('course', 'courseName courseCode')
      .populate('faculty', 'name employeeId designation')
      .sort({ subjectCode: 1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create subject
 * @route   POST /api/subjects
 * @access  Private/Admin
 */
exports.createSubject = async (req, res, next) => {
  try {
    const { subjectCode, subjectName, course, department, semester, credits, faculty, status } = req.body;

    const existing = await Subject.findOne({ subjectCode: subjectCode.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Subject with code "${subjectCode}" already exists.`,
      });
    }

    const subjectId = `SUB-${subjectCode.toUpperCase().trim()}`;

    const subject = await Subject.create({
      subjectId,
      subjectCode: subjectCode.toUpperCase().trim(),
      subjectName: subjectName.trim(),
      course,
      department,
      semester,
      credits: Number(credits) || 4,
      faculty: faculty || null,
      status: status || 'Active',
    });

    const populated = await Subject.findById(subject._id)
      .populate('department', 'name code')
      .populate('course', 'courseName courseCode')
      .populate('faculty', 'name employeeId designation');

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update subject
 * @route   PUT /api/subjects/:id
 * @access  Private/Admin
 */
exports.updateSubject = async (req, res, next) => {
  try {
    const { subjectCode, subjectName, course, department, semester, credits, faculty, status } = req.body;

    let subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    subject.subjectCode = subjectCode ? subjectCode.toUpperCase().trim() : subject.subjectCode;
    subject.subjectName = subjectName ? subjectName.trim() : subject.subjectName;
    if (course) subject.course = course;
    if (department) subject.department = department;
    if (semester) subject.semester = semester;
    if (credits !== undefined) subject.credits = Number(credits);
    subject.faculty = faculty !== undefined ? (faculty || null) : subject.faculty;
    if (status) subject.status = status;

    await subject.save();

    const populated = await Subject.findById(subject._id)
      .populate('department', 'name code')
      .populate('course', 'courseName courseCode')
      .populate('faculty', 'name employeeId designation');

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete subject
 * @route   DELETE /api/subjects/:id
 * @access  Private/Admin
 */
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    await Subject.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
