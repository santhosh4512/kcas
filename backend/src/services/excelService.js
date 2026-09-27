const XLSX = require('xlsx');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

/**
 * Helper to find field value across multiple possible column aliases
 */
function getColumnValue(row, possibleNames, defaultValue = '') {
  const keys = Object.keys(row);
  for (const name of possibleNames) {
    const directKey = keys.find(
      (k) => k.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    );
    if (directKey && row[directKey] !== undefined && row[directKey] !== null && String(row[directKey]).trim() !== '') {
      return String(row[directKey]).trim();
    }
  }
  return defaultValue;
}

/**
 * Standardize year string (e.g. "1" -> "I Year", "2nd" -> "II Year", "III Year" -> "III Year")
 */
function standardizeYear(val) {
  if (!val) return 'I Year';
  const v = String(val).trim().toUpperCase();
  if (v.includes('IV') || v.includes('4') || v.includes('FINAL')) return 'IV Year';
  if (v.includes('III') || v.includes('3') || v.includes('THIRD')) return 'III Year';
  if (v.includes('II') || v.includes('2') || v.includes('SECOND')) return 'II Year';
  if (v.includes('I') || v.includes('1') || v.includes('FIRST')) return 'I Year';
  return val;
}

/**
 * Standardize semester from year or semester string
 */
function standardizeSemester(semVal, yearVal) {
  if (semVal) {
    const s = String(semVal).trim().toUpperCase();
    if (s.includes('1') || s.includes('I') && !s.includes('II') && !s.includes('IV')) return 'Semester 1';
    if (s.includes('2') || s.includes('II')) return 'Semester 2';
    if (s.includes('3') || s.includes('III')) return 'Semester 3';
    if (s.includes('4') || s.includes('IV')) return 'Semester 4';
    if (s.includes('5') || s.includes('V')) return 'Semester 5';
    if (s.includes('6') || s.includes('VI')) return 'Semester 6';
  }
  const y = standardizeYear(yearVal);
  if (y === 'I Year') return 'Semester 1';
  if (y === 'II Year') return 'Semester 3';
  if (y === 'III Year') return 'Semester 5';
  if (y === 'IV Year') return 'Semester 7';
  return 'Semester 1';
}

/**
 * Generate Excel Template for Students
 */
function generateStudentTemplate() {
  const data = [
    {
      'Register Number': '22UCS101',
      'Student Name': 'K. Ananya',
      'Department': 'Computer Science',
      'Class/Section': 'III B.Sc CS - A',
      'Year': 'III Year',
      'Email': 'ananya.cs@kambancollege.edu.in',
      'Phone Number': '9876543210',
      'Mentor Name': 'Dr. S. Kanimozhi',
      'Attendance': '92%',
      'Marks': '88%',
      'Skills': 'React, Python, Machine Learning',
      'Achievements': '1st Prize Hackathon 2025, Zonal Sports Winner',
      'Activities': 'Coding Club Secretary, NSS Volunteer',
    },
    {
      'Register Number': '22UCS102',
      'Student Name': 'M. Divyabharathi',
      'Department': 'Computer Science',
      'Class/Section': 'III B.Sc CS - A',
      'Year': 'III Year',
      'Email': 'divya.cs@kambancollege.edu.in',
      'Phone Number': '9876543211',
      'Mentor Name': 'Dr. S. Kanimozhi',
      'Attendance': '86%',
      'Marks': '82%',
      'Skills': 'Classical Dance, English Oratory, Java',
      'Achievements': 'State Level Natyanjali Gold Medalist',
      'Activities': 'Cultural Team Lead, Debate Club',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Student_Import_Template');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Generate Excel Template for Faculty
 */
function generateFacultyTemplate() {
  const data = [
    {
      'Employee ID': 'FAC101',
      'Faculty Name': 'Dr. S. Kanimozhi',
      'Qualification': 'M.Sc., M.Phil., Ph.D.',
      'Designation': 'Associate Professor & Senior Mentor',
      'Department Code': 'CS',
      'Email': 'kanimozhi.cs@kambancollege.edu.in',
      'Phone': '9840122334',
      'Experience': '12 Years',
      'Specialization': 'Artificial Intelligence, Data Structures',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Faculty_Template');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Generate Excel Template for Marks
 */
function generateMarksTemplate() {
  const data = [
    {
      'Register Number': '22UCS101',
      'Student Name': 'K. Ananya',
      'Subject Code': 'CS301',
      'Semester': 'Semester 5',
      'Internal Mark (Max 25)': 24,
      'External Mark (Max 75)': 68,
    },
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Marks_Template');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Parse & Validate Student Excel Sheet with Dynamic Mapping & Deep Field Parsing
 */
async function validateAndParseStudentExcel(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The uploaded Excel/CSV sheet contains no data rows.');
  }

  // Load departments, courses, faculty mentors, and existing students
  const [departments, courses, faculties, existingStudents] = await Promise.all([
    Department.find({}, 'code _id name'),
    Course.find({}, 'courseCode _id courseName department'),
    Faculty.find({}, 'name email employeeId _id department'),
    Student.find({}, 'registerNumber email rollNumber'),
  ]);

  const deptCodeMap = new Map();
  const deptNameMap = new Map();
  departments.forEach((d) => {
    deptCodeMap.set(d.code.toUpperCase(), d);
    deptNameMap.set(d.name.toLowerCase(), d);
  });

  const courseMap = new Map();
  courses.forEach((c) => {
    courseMap.set(c.courseCode.toUpperCase(), c);
    courseMap.set(c.courseName.toLowerCase(), c);
  });

  const facultyMap = new Map();
  faculties.forEach((f) => {
    facultyMap.set(f.name.toLowerCase().trim(), f);
    if (f.email) facultyMap.set(f.email.toLowerCase().trim(), f);
  });

  const existingRegNumbers = new Set(existingStudents.map((s) => s.registerNumber.toUpperCase()));
  const existingEmails = new Set(existingStudents.map((s) => s.email.toLowerCase()));

  const seenInBatchRegs = new Set();
  const seenInBatchEmails = new Set();

  const validRecords = [];
  const errorRecords = [];
  let duplicateCount = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const rowNum = i + 2; // Row in Excel
    const row = rawRows[i];
    const errors = [];
    const warnings = [];

    // Extract mapped fields using aliases
    const regNo = getColumnValue(row, [
      'Register Number', 'Register No', 'Reg No', 'RegNo', 'Registration Number',
      'Registration No', 'Reg_No', 'RegisterNumber', 'Student ID', 'Roll No', 'Roll Number'
    ]).toUpperCase();

    const name = getColumnValue(row, [
      'Student Name', 'Name', 'StudentName', 'Candidate Name', 'Full Name', 'Name of the Student'
    ]);

    const rawDept = getColumnValue(row, [
      'Department', 'Dept', 'Department Code', 'Dept Code', 'Branch', 'Department Name'
    ]);

    const rawClassSection = getColumnValue(row, [
      'Class/Section', 'Class / Section', 'Class', 'Section', 'Course/Section', 'Sec', 'Class & Sec'
    ]);

    const rawYear = getColumnValue(row, [
      'Year', 'Academic Year', 'Year of Study', 'Batch Year'
    ]);

    let email = getColumnValue(row, [
      'Email', 'Email ID', 'Mail ID', 'Student Email', 'Email Address', 'E-mail'
    ]).toLowerCase();

    const phone = getColumnValue(row, [
      'Phone Number', 'Phone', 'Mobile', 'Mobile No', 'Contact Number', 'Phone_Number', 'Contact No'
    ]);

    const mentorName = getColumnValue(row, [
      'Mentor Name', 'Mentor', 'Faculty Mentor', 'Staff Advisor', 'Advisor', 'Tutor'
    ]);

    const rawAttendance = getColumnValue(row, [
      'Attendance', 'Attendance %', 'Attendance Percentage', 'Att %', 'Present %', 'Overall Attendance'
    ]);

    const rawMarks = getColumnValue(row, [
      'Marks', 'Marks %', 'Mark', 'Average Marks', 'Percentage', 'CGPA', 'Score', 'Overall Marks'
    ]);

    const rawSkills = getColumnValue(row, [
      'Skills', 'Skill', 'Technical Skills', 'Key Skills', 'Core Skills'
    ]);

    const rawAchievements = getColumnValue(row, [
      'Achievements', 'Achievement', 'Awards', 'Honors', 'Prizes'
    ]);

    const rawActivities = getColumnValue(row, [
      'Activities', 'Activity', 'Extracurricular', 'Sports', 'Clubs', 'Co-curricular'
    ]);

    const gender = getColumnValue(row, ['Gender', 'Sex'], 'Female');
    const dob = getColumnValue(row, ['Date of Birth', 'DOB', 'Birth Date'], '2004-01-01');
    const parentName = getColumnValue(row, ['Parent Name', 'Father Name', 'Guardian Name'], 'Parent / Guardian');
    const parentPhone = getColumnValue(row, ['Parent Phone', 'Father Mobile', 'Guardian Phone'], '');
    const address = getColumnValue(row, ['Address', 'City', 'Location'], 'Tiruvannamalai, Tamil Nadu');

    // 1. Mandatory Validations
    if (!regNo) {
      errors.push('Missing Register Number (Mandatory field)');
    }
    if (!name) {
      errors.push('Missing Student Name (Mandatory field)');
    }

    // Auto-generate college email if missing
    if (!email && regNo) {
      const cleanReg = regNo.toLowerCase().replace(/[^a-z0-9]/g, '');
      email = `${cleanReg}@kambancollege.edu.in`;
      warnings.push(`Email was generated automatically: ${email}`);
    }

    // Duplicate Checks
    if (regNo && existingRegNumbers.has(regNo)) {
      errors.push(`Duplicate: Register Number "${regNo}" already exists in the system.`);
      duplicateCount++;
    } else if (regNo && seenInBatchRegs.has(regNo)) {
      errors.push(`Duplicate in file: Register Number "${regNo}" appears more than once.`);
      duplicateCount++;
    } else if (regNo) {
      seenInBatchRegs.add(regNo);
    }

    if (email && existingEmails.has(email)) {
      errors.push(`Duplicate: Email "${email}" already registered with another student.`);
      duplicateCount++;
    } else if (email && seenInBatchEmails.has(email)) {
      errors.push(`Duplicate in file: Email "${email}" appears multiple times.`);
      duplicateCount++;
    } else if (email) {
      seenInBatchEmails.add(email);
    }

    // Parse Year & Semester
    const year = standardizeYear(rawYear || rawClassSection);
    const semester = standardizeSemester('', year);

    // Extract Section (e.g. from "III B.Sc CS - A" -> "A")
    let section = 'A';
    if (rawClassSection) {
      const secMatch = rawClassSection.match(/\b([A-D])\b/i) || rawClassSection.match(/[-_/\s]([A-D])$/i);
      if (secMatch) section = secMatch[1].toUpperCase();
    }

    // Match or resolve Department
    let matchedDept = null;
    if (rawDept) {
      const upperDept = rawDept.toUpperCase().trim();
      const lowerDept = rawDept.toLowerCase().trim();
      matchedDept = deptCodeMap.get(upperDept) || deptNameMap.get(lowerDept);
      
      // Fuzzy department search
      if (!matchedDept) {
        for (const [code, d] of deptCodeMap.entries()) {
          if (upperDept.includes(code) || d.name.toLowerCase().includes(lowerDept)) {
            matchedDept = d;
            break;
          }
        }
      }
    }
    // Fallback default department if needed
    if (!matchedDept && departments.length > 0) {
      matchedDept = departments[0]; // Computer Science
      if (rawDept) {
        warnings.push(`Department "${rawDept}" mapped to default: ${matchedDept.name}`);
      }
    }

    // Match or resolve Course
    let matchedCourse = null;
    if (matchedDept) {
      matchedCourse = courses.find((c) => String(c.department) === String(matchedDept._id)) || courses[0];
    } else if (courses.length > 0) {
      matchedCourse = courses[0];
    }

    // Match Mentor if provided
    let matchedMentor = null;
    if (mentorName) {
      matchedMentor = facultyMap.get(mentorName.toLowerCase().trim()) || null;
    }

    // Parse Attendance numeric percentage (e.g. "92%", "85.5", "90" -> 92)
    let attendancePercentage = 85;
    if (rawAttendance) {
      const numMatch = String(rawAttendance).match(/[\d.]+/);
      if (numMatch) {
        const parsedNum = parseFloat(numMatch[0]);
        if (!isNaN(parsedNum)) {
          attendancePercentage = Math.min(100, Math.max(0, parsedNum));
        }
      }
    }

    // Parse Marks numeric percentage (e.g. "88%", "75.4", "8.5 CGPA" -> 85)
    let marksPercentage = 75;
    if (rawMarks) {
      const numMatch = String(rawMarks).match(/[\d.]+/);
      if (numMatch) {
        let parsedNum = parseFloat(numMatch[0]);
        if (!isNaN(parsedNum)) {
          if (parsedNum <= 10 && String(rawMarks).toLowerCase().includes('cgpa')) {
            parsedNum = parsedNum * 9.5; // CGPA to % conversion
          }
          marksPercentage = Math.min(100, Math.max(0, parsedNum));
        }
      }
    }

    // Parse Skills, Achievements, Activities lists
    const skillsList = rawSkills
      ? rawSkills.split(/[,;\n|]/).map((s) => s.trim()).filter(Boolean)
      : [];

    const achievementsList = rawAchievements
      ? rawAchievements.split(/[,;\n|]/).map((a) => a.trim()).filter(Boolean)
      : [];

    const activitiesList = rawActivities
      ? rawActivities.split(/[,;\n|]/).map((ac) => ac.trim()).filter(Boolean)
      : [];

    // Construct talent array
    const talents = [];
    skillsList.forEach((sk) => {
      talents.push({
        category: 'Coding',
        skillName: sk,
        proficiency: 'Advanced',
        achievements: achievementsList[0] || 'Proficient in application development',
      });
    });

    if (achievementsList.length > 0) {
      talents.push({
        category: 'Sports',
        skillName: 'Extracurricular & Merit Achievement',
        proficiency: 'Advanced',
        achievements: achievementsList.join('; '),
      });
    }

    if (activitiesList.length > 0) {
      talents.push({
        category: 'Leadership',
        skillName: activitiesList[0],
        proficiency: 'Intermediate',
        achievements: activitiesList.join('; '),
      });
    }

    const processedData = {
      studentId: `STU-${regNo}`,
      registerNumber: regNo,
      rollNumber: regNo,
      name,
      dob,
      gender,
      email,
      phone: phone || '+91 98765 00000',
      address,
      department: matchedDept ? matchedDept._id : (departments[0] ? departments[0]._id : null),
      departmentName: matchedDept ? matchedDept.name : (rawDept || 'Computer Science'),
      departmentCode: matchedDept ? matchedDept.code : 'CS',
      course: matchedCourse ? matchedCourse._id : (courses[0] ? courses[0]._id : null),
      courseName: matchedCourse ? matchedCourse.courseName : 'B.Sc. Computer Science',
      year,
      semester,
      section,
      parentName,
      parentPhone,
      mentor: matchedMentor ? matchedMentor._id : null,
      mentorName: mentorName || (matchedMentor ? matchedMentor.name : ''),
      initialAttendance: attendancePercentage,
      initialMarks: marksPercentage,
      skills: skillsList,
      achievements: achievementsList,
      activities: activitiesList,
      talents,
      status: 'Active',
      warnings,
    };

    if (errors.length > 0) {
      errorRecords.push({
        rowNumber: rowNum,
        data: processedData,
        raw: row,
        errors,
        warnings,
      });
    } else {
      validRecords.push({
        rowNumber: rowNum,
        data: processedData,
        warnings,
      });
    }
  }

  return {
    totalRows: rawRows.length,
    validCount: validRecords.length,
    errorCount: errorRecords.length,
    duplicateCount,
    validRecords,
    errorRecords,
  };
}

module.exports = {
  generateStudentTemplate,
  generateFacultyTemplate,
  generateMarksTemplate,
  validateAndParseStudentExcel,
};
