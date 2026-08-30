const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Department = require('../models/Department');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Get all courses with optional department filter
 * @route   GET /api/courses
 * @access  Private
 */
exports.getCourses = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    const query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { courseName: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query)
      .populate('department', 'name code')
      .sort({ courseName: 1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create course
 * @route   POST /api/courses
 * @access  Private/Admin
 */
exports.createCourse = async (req, res, next) => {
  try {
    const { courseName, courseCode, department, duration, courseType, status } = req.body;

    const existing = await Course.findOne({ courseCode: courseCode.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Course with code "${courseCode}" already exists.`,
      });
    }

    const courseId = `CRS-${courseCode.toUpperCase().trim()}`;

    const course = await Course.create({
      courseId,
      courseName: courseName.trim(),
      courseCode: courseCode.toUpperCase().trim(),
      department,
      duration: duration || '3 Years (6 Semesters)',
      courseType: courseType || 'Undergraduate (UG)',
      status: status || 'Active',
    });

    const populated = await Course.findById(course._id).populate('department', 'name code');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private/Admin
 */
exports.updateCourse = async (req, res, next) => {
  try {
    const { courseName, courseCode, department, duration, courseType, status } = req.body;

    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    course.courseName = courseName ? courseName.trim() : course.courseName;
    course.courseCode = courseCode ? courseCode.toUpperCase().trim() : course.courseCode;
    if (department) course.department = department;
    if (duration) course.duration = duration;
    if (courseType) course.courseType = courseType;
    if (status) course.status = status;

    await course.save();
    const populated = await Course.findById(course._id).populate('department', 'name code');

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private/Admin
 */
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const subjectCount = await Subject.countDocuments({ course: course._id });
    if (subjectCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete course. There are ${subjectCount} subjects registered under it.`,
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
