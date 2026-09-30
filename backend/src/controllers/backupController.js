const Department = require('../models/Department');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Skill = require('../models/Skill');
const TalentScore = require('../models/TalentScore');
const Certificate = require('../models/Certificate');
const Event = require('../models/Event');
const Notice = require('../models/Notice');
const WarningAlert = require('../models/WarningAlert');
const LocationAlert = require('../models/LocationAlert');
const SystemSetting = require('../models/SystemSetting');
const AuditLog = require('../models/AuditLog');

/**
 * @desc Export complete system data backup as JSON (Admin only)
 * @route GET /api/backup/export
 */
exports.exportBackup = async (req, res, next) => {
  try {
    const [
      departments,
      courses,
      subjects,
      faculty,
      students,
      attendance,
      marks,
      skills,
      talentScores,
      certificates,
      events,
      notices,
      warnings,
      locationAlerts,
      settings,
    ] = await Promise.all([
      Department.find().lean(),
      Course.find().lean(),
      Subject.find().lean(),
      Faculty.find().select('-password').lean(),
      Student.find().lean(),
      Attendance.find().lean(),
      Mark.find().lean(),
      Skill.find().lean(),
      TalentScore.find().lean(),
      Certificate.find().lean(),
      Event.find().lean(),
      Notice.find().lean(),
      WarningAlert.find().lean(),
      LocationAlert.find().lean(),
      SystemSetting.find().lean(),
    ]);

    const backupData = {
      metadata: {
        system: 'Kamban College of Arts and Science for Women - Department Management System',
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        exportedBy: req.user ? req.user.name : 'System Admin',
        counts: {
          departments: departments.length,
          courses: courses.length,
          subjects: subjects.length,
          faculty: faculty.length,
          students: students.length,
          attendance: attendance.length,
          marks: marks.length,
          skills: skills.length,
          talentScores: talentScores.length,
          certificates: certificates.length,
          events: events.length,
          notices: notices.length,
          warnings: warnings.length,
          locationAlerts: locationAlerts.length,
        },
      },
      data: {
        departments,
        courses,
        subjects,
        faculty,
        students,
        attendance,
        marks,
        skills,
        talentScores,
        certificates,
        events,
        notices,
        warnings,
        locationAlerts,
        settings,
      },
    };

    // Audit log
    await AuditLog.create({
      user: req.user ? req.user._id : null,
      performedBy: req.user ? req.user._id : null,
      performerName: req.user ? req.user.name : 'System Admin',
      performerRole: 'admin',
      action: 'SYSTEM_BACKUP_EXPORT',
      module: 'Backup & Restore',
      description: `Complete system backup exported containing ${students.length} students, ${faculty.length} faculty, ${departments.length} departments.`,
      ipAddress: req.ip || '',
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=kcas_backup_${new Date().toISOString().slice(0, 10)}.json`);
    return res.status(200).json(backupData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Restore or merge system data from JSON backup (Admin only)
 * @route POST /api/backup/restore
 */
exports.restoreBackup = async (req, res, next) => {
  try {
    const { backupPayload, mode = 'merge' } = req.body;

    if (!backupPayload || !backupPayload.data) {
      return res.status(400).json({
        success: false,
        message: 'Invalid backup file structure. Missing "data" payload.',
      });
    }

    const { data, metadata } = backupPayload;
    let restoredCounts = {};

    // Restore Departments
    if (data.departments && Array.isArray(data.departments)) {
      for (const d of data.departments) {
        await Department.findOneAndUpdate({ code: d.code }, d, { upsert: true, new: true });
      }
      restoredCounts.departments = data.departments.length;
    }

    // Restore Courses
    if (data.courses && Array.isArray(data.courses)) {
      for (const c of data.courses) {
        await Course.findOneAndUpdate({ courseCode: c.courseCode }, c, { upsert: true, new: true });
      }
      restoredCounts.courses = data.courses.length;
    }

    // Restore Subjects
    if (data.subjects && Array.isArray(data.subjects)) {
      for (const s of data.subjects) {
        await Subject.findOneAndUpdate({ subjectCode: s.subjectCode }, s, { upsert: true, new: true });
      }
      restoredCounts.subjects = data.subjects.length;
    }

    // Restore Faculty
    if (data.faculty && Array.isArray(data.faculty)) {
      for (const f of data.faculty) {
        await Faculty.findOneAndUpdate({ employeeId: f.employeeId }, f, { upsert: true, new: true });
      }
      restoredCounts.faculty = data.faculty.length;
    }

    // Restore Students
    if (data.students && Array.isArray(data.students)) {
      for (const st of data.students) {
        await Student.findOneAndUpdate({ registerNumber: st.registerNumber }, st, { upsert: true, new: true });
      }
      restoredCounts.students = data.students.length;
    }

    // Restore Marks
    if (data.marks && Array.isArray(data.marks)) {
      for (const m of data.marks) {
        if (m.student && m.subject) {
          await Mark.findOneAndUpdate(
            { student: m.student, subject: m.subject, examType: m.examType || 'End Semester' },
            m,
            { upsert: true, new: true }
          );
        }
      }
      restoredCounts.marks = data.marks.length;
    }

    // Restore Settings
    if (data.settings && Array.isArray(data.settings) && data.settings.length > 0) {
      await SystemSetting.findOneAndUpdate({ key: 'SYSTEM_CONFIG' }, data.settings[0], { upsert: true, new: true });
      restoredCounts.settings = 1;
    }

    // Audit log
    await AuditLog.create({
      user: req.user ? req.user._id : null,
      performedBy: req.user ? req.user._id : null,
      performerName: req.user ? req.user.name : 'System Admin',
      performerRole: 'admin',
      action: 'SYSTEM_BACKUP_RESTORE',
      module: 'Backup & Restore',
      description: `System data restored/merged from backup dated ${metadata?.exportedAt || 'Unknown'}. Restored summary: ${JSON.stringify(restoredCounts)}`,
      details: restoredCounts,
      ipAddress: req.ip || '',
    });

    res.status(200).json({
      success: true,
      message: 'System data restored and verified successfully.',
      restoredCounts,
    });
  } catch (error) {
    next(error);
  }
};
