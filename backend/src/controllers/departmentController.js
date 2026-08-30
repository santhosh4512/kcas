const Department = require('../models/Department');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Get all departments with optional search and filter
 * @route   GET /api/departments
 * @access  Private
 */
exports.getDepartments = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { hod: { $regex: search, $options: 'i' } },
      ];
    }

    const departments = await Department.find(query).sort({ name: 1 });

    // Attach real counts for each department
    const deptsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const [studentCount, facultyCount, courseCount] = await Promise.all([
          Student.countDocuments({ department: dept._id, status: 'Active' }),
          Faculty.countDocuments({ department: dept._id, status: 'Active' }),
          Course.countDocuments({ department: dept._id, status: 'Active' }),
        ]);

        return {
          ...dept.toObject(),
          studentCount,
          facultyCount,
          courseCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: deptsWithCounts.length,
      data: deptsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single department by ID
 * @route   GET /api/departments/:id
 * @access  Private
 */
exports.getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const courses = await Course.find({ department: department._id });
    const faculty = await Faculty.find({ department: department._id });
    const studentCount = await Student.countDocuments({ department: department._id });

    res.status(200).json({
      success: true,
      data: {
        ...department.toObject(),
        courses,
        faculty,
        studentCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new department
 * @route   POST /api/departments
 * @access  Private/Admin
 */
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code, hod, description, status } = req.body;

    // Check code uniqueness
    const existing = await Department.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Department with code "${code}" already exists.`,
      });
    }

    const deptId = `DEPT-${code.toUpperCase().trim()}`;

    const department = await Department.create({
      departmentId: deptId,
      name: name.trim(),
      code: code.toUpperCase().trim(),
      hod: hod.trim(),
      description: description || '',
      status: status || 'Active',
    });

    await AuditLog.create({
      action: 'CREATE_DEPARTMENT',
      module: 'DEPARTMENTS',
      entityId: department.code,
      performedBy: req.user._id,
      performerName: req.user.name,
      performerRole: req.user.role,
      details: { name: department.name, code: department.code },
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update department
 * @route   PUT /api/departments/:id
 * @access  Private/Admin
 */
exports.updateDepartment = async (req, res, next) => {
  try {
    const { name, code, hod, description, status } = req.body;

    let department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Check code uniqueness if changed
    if (code && code.toUpperCase() !== department.code) {
      const existing = await Department.findOne({ code: code.toUpperCase().trim() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Department code "${code}" is already in use.`,
        });
      }
    }

    department.name = name ? name.trim() : department.name;
    department.code = code ? code.toUpperCase().trim() : department.code;
    department.hod = hod ? hod.trim() : department.hod;
    department.description = description !== undefined ? description : department.description;
    department.status = status || department.status;

    await department.save();

    await AuditLog.create({
      action: 'UPDATE_DEPARTMENT',
      module: 'DEPARTMENTS',
      entityId: department.code,
      performedBy: req.user._id,
      performerName: req.user.name,
      performerRole: req.user.role,
      details: { name: department.name, code: department.code },
    });

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete department
 * @route   DELETE /api/departments/:id
 * @access  Private/Admin
 */
exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Check if students or faculty exist under this department
    const studentCount = await Student.countDocuments({ department: department._id });
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. There are ${studentCount} active students enrolled.`,
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      action: 'DELETE_DEPARTMENT',
      module: 'DEPARTMENTS',
      entityId: department.code,
      performedBy: req.user._id,
      performerName: req.user.name,
      performerRole: req.user.role,
      details: { code: department.code },
    });

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
