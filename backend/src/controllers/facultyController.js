const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Subject = require('../models/Subject');
const User = require('../models/User');
const excelService = require('../services/excelService');
const XLSX = require('xlsx');

/**
 * @desc    Get all faculty with pagination & filters
 * @route   GET /api/faculty
 * @access  Private
 */
exports.getFaculty = async (req, res, next) => {
  try {
    const { department, designation, status, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (department && department !== 'All') query.department = department;
    if (designation && designation !== 'All') query.designation = designation;
    if (status && status !== 'All') query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Faculty.countDocuments(query);
    const faculty = await Faculty.find(query)
      .populate('department', 'name code')
      .populate('assignedSubjects', 'subjectCode subjectName semester')
      .sort({ employeeId: 1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: faculty.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single faculty member
 * @route   GET /api/faculty/:id
 * @access  Private
 */
exports.getFacultyById = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('department', 'name code')
      .populate('assignedSubjects', 'subjectCode subjectName semester credits');

    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty member not found' });
    }

    res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create faculty member
 * @route   POST /api/faculty
 * @access  Private/Admin
 */
exports.createFaculty = async (req, res, next) => {
  try {
    const {
      employeeId,
      name,
      qualification,
      designation,
      department,
      email,
      phone,
      experience,
      specialization,
      assignedSubjects,
      status,
      profilePhoto,
      createAccount = true,
    } = req.body;

    const existing = await Faculty.findOne({
      $or: [{ employeeId: employeeId.toUpperCase().trim() }, { email: email.toLowerCase().trim() }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Faculty with this Employee ID or Email already exists.',
      });
    }

    const faculty = await Faculty.create({
      facultyId: `FAC-${employeeId.toUpperCase().trim()}`,
      employeeId: employeeId.toUpperCase().trim(),
      name: name.trim(),
      qualification: qualification.trim(),
      designation: designation.trim(),
      department,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      experience: experience || '1 Year',
      specialization: specialization || 'General',
      assignedSubjects: assignedSubjects || [],
      status: status || 'Active',
      profilePhoto: profilePhoto || '',
    });

    // Optionally create user login for faculty
    if (createAccount) {
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (!existingUser) {
        await User.create({
          name: faculty.name,
          email: faculty.email,
          password: 'Password@123', // Default faculty password
          role: 'faculty',
          department: faculty.department,
          referenceId: faculty._id,
          roleRefModel: 'Faculty',
          avatar: profilePhoto || '',
          profilePhoto: profilePhoto || '',
        });
      }
    }

    const populated = await Faculty.findById(faculty._id)
      .populate('department', 'name code')
      .populate('assignedSubjects', 'subjectCode subjectName');

    res.status(201).json({
      success: true,
      message: 'Faculty profile created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update faculty member
 * @route   PUT /api/faculty/:id
 * @access  Private/Admin
 */
exports.updateFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    const {
      name,
      qualification,
      designation,
      department,
      email,
      phone,
      experience,
      specialization,
      assignedSubjects,
      status,
      profilePhoto,
    } = req.body;

    if (name) faculty.name = name.trim();
    if (qualification) faculty.qualification = qualification.trim();
    if (designation) faculty.designation = designation.trim();
    if (department) faculty.department = department;
    if (email) faculty.email = email.toLowerCase().trim();
    if (phone) faculty.phone = phone.trim();
    if (experience) faculty.experience = experience;
    if (specialization) faculty.specialization = specialization;
    if (assignedSubjects) faculty.assignedSubjects = assignedSubjects;
    if (status) faculty.status = status;
    if (profilePhoto !== undefined) faculty.profilePhoto = profilePhoto;

    await faculty.save();

    // Also update linked user profile photo if exists
    if (profilePhoto !== undefined) {
      await User.updateMany(
        { $or: [{ email: faculty.email }, { referenceId: faculty._id }] },
        { avatar: profilePhoto, profilePhoto: profilePhoto }
      );
    }

    const populated = await Faculty.findById(faculty._id)
      .populate('department', 'name code')
      .populate('assignedSubjects', 'subjectCode subjectName');

    res.status(200).json({
      success: true,
      message: 'Faculty updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete faculty member
 * @route   DELETE /api/faculty/:id
 * @access  Private/Admin
 */
exports.deleteFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    await User.deleteOne({ email: faculty.email });
    await Faculty.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Faculty deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download Faculty Excel Template
 * @route   GET /api/faculty/template
 * @access  Private
 */
exports.downloadTemplate = async (req, res, next) => {
  try {
    const buffer = excelService.generateFacultyTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=KCAS_Faculty_Import_Template.xlsx');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Preview & Validate Faculty Excel Upload
 * @route   POST /api/faculty/preview-excel
 * @access  Private/Admin
 */
exports.previewExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file (.xlsx, .xls)' });
    }

    const validationResult = await excelService.validateAndParseFacultyExcel(req.file.buffer);
    res.status(200).json({
      success: true,
      data: validationResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Confirm and Import Validated Faculty records
 * @route   POST /api/faculty/import
 * @access  Private/Admin
 */
exports.importFaculty = async (req, res, next) => {
  try {
    const { records } = req.body;
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid records provided for import' });
    }

    const insertedFaculty = [];
    const insertedUsers = [];

    for (const item of records) {
      const created = await Faculty.create({
        facultyId: item.facultyId || `FAC-${item.employeeId}`,
        employeeId: item.employeeId,
        name: item.name,
        qualification: item.qualification,
        designation: item.designation,
        department: item.department,
        email: item.email,
        phone: item.phone,
        experience: item.experience || '1 Year',
        specialization: item.specialization || 'General',
        status: 'Active',
      });
      insertedFaculty.push(created);

      // Create faculty user account
      try {
        const user = await User.create({
          name: created.name,
          email: created.email,
          password: 'Password@123',
          role: 'faculty',
          department: created.department,
          referenceId: created._id,
          roleRefModel: 'Faculty',
        });
        insertedUsers.push(user);
      } catch (err) {
        // Continue if user already existed
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully imported ${insertedFaculty.length} faculty members.`,
      count: insertedFaculty.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export Faculty to Excel
 * @route   GET /api/faculty/export
 * @access  Private
 */
exports.exportFaculty = async (req, res, next) => {
  try {
    const { department, status } = req.query;
    const query = {};
    if (department && department !== 'All') query.department = department;
    if (status && status !== 'All') query.status = status;

    const facultyList = await Faculty.find(query).populate('department', 'name code');

    const exportData = facultyList.map((f) => ({
      'Employee ID': f.employeeId,
      'Faculty Name': f.name,
      'Department': f.department ? f.department.name : '',
      'Department Code': f.department ? f.department.code : '',
      'Designation': f.designation,
      'Qualification': f.qualification,
      'Email': f.email,
      'Phone': f.phone,
      'Experience': f.experience,
      'Specialization': f.specialization,
      'Status': f.status,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Faculty_Directory');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=KCAS_Faculty_Export.xlsx');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
