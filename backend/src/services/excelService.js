const XLSX = require('xlsx');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

/**
 * Generate Excel Template for Students
 */
function generateStudentTemplate() {
  const data = [
    {
      'Register Number': '24UBCS001',
      'Roll Number': 'CS2401',
      'Student Name': 'Kanimozhi R',
      'Gender': 'Female',
      'Date of Birth (YYYY-MM-DD)': '2005-04-12',
      'Email': 'kanimozhi.cs@kcas.edu.in',
      'Phone': '9876543210',
      'Department Code': 'CS',
      'Course Code': 'BSC-CS',
      'Year': 'I Year',
      'Semester': 'Semester 1',
      'Section': 'A',
      'Parent Name': 'Rajendran M',
      'Parent Phone': '9443322110',
      'Address': 'Tiruvannamalai, Tamil Nadu',
    },
    {
      'Register Number': '24UBCS002',
      'Roll Number': 'CS2402',
      'Student Name': 'Priyadharshini S',
      'Gender': 'Female',
      'Date of Birth (YYYY-MM-DD)': '2005-08-20',
      'Email': 'priyadharshini.cs@kcas.edu.in',
      'Phone': '9876543211',
      'Department Code': 'CS',
      'Course Code': 'BSC-CS',
      'Year': 'I Year',
      'Semester': 'Semester 1',
      'Section': 'A',
      'Parent Name': 'Senthil Kumar',
      'Parent Phone': '9443322111',
      'Address': 'Chengam, Tiruvannamalai',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students_Template');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Generate Excel Template for Faculty
 */
function generateFacultyTemplate() {
  const data = [
    {
      'Employee ID': 'EMP101',
      'Faculty Name': 'Dr. K. Anitha',
      'Qualification': 'Ph.D., M.Sc., M.Phil.',
      'Designation': 'Associate Professor & HOD',
      'Department Code': 'CS',
      'Email': 'anitha.cs@kcas.edu.in',
      'Phone': '9840123456',
      'Experience': '12 Years',
      'Specialization': 'Machine Learning, Data Mining',
    },
    {
      'Employee ID': 'EMP102',
      'Faculty Name': 'Mrs. M. Saranya',
      'Qualification': 'M.C.A., M.Phil., SET',
      'Designation': 'Assistant Professor',
      'Department Code': 'CS',
      'Email': 'saranya.cs@kcas.edu.in',
      'Phone': '9840123457',
      'Experience': '6 Years',
      'Specialization': 'Web Technologies, Cloud Computing',
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
      'Register Number': '24UBCS001',
      'Student Name': 'Kanimozhi R',
      'Subject Code': 'CS101',
      'Semester': 'Semester 1',
      'Internal Mark (Max 25)': 23,
      'External Mark (Max 75)': 68,
    },
    {
      'Register Number': '24UBCS002',
      'Student Name': 'Priyadharshini S',
      'Subject Code': 'CS101',
      'Semester': 'Semester 1',
      'Internal Mark (Max 25)': 21,
      'External Mark (Max 75)': 62,
    },
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Marks_Template');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Parse & Validate Student Excel Sheet
 */
async function validateAndParseStudentExcel(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The uploaded Excel sheet contains no data rows.');
  }

  // Load existing records and reference caches
  const [departments, courses, existingStudents] = await Promise.all([
    Department.find({}, 'code _id name'),
    Course.find({}, 'courseCode _id courseName department'),
    Student.find({}, 'registerNumber email rollNumber'),
  ]);

  const deptMap = new Map();
  departments.forEach((d) => deptMap.set(d.code.toUpperCase(), d));

  const courseMap = new Map();
  courses.forEach((c) => courseMap.set(c.courseCode.toUpperCase(), c));

  const existingRegNumbers = new Set(existingStudents.map((s) => s.registerNumber.toUpperCase()));
  const existingEmails = new Set(existingStudents.map((s) => s.email.toLowerCase()));

  const seenInBatchRegs = new Set();
  const seenInBatchEmails = new Set();

  const validRecords = [];
  const errorRecords = [];

  for (let i = 0; i < rawRows.length; i++) {
    const rowNum = i + 2; // Row number in Excel (header is row 1)
    const row = rawRows[i];
    const errors = [];

    const regNo = String(row['Register Number'] || row['registerNumber'] || '').trim().toUpperCase();
    const rollNo = String(row['Roll Number'] || row['rollNumber'] || '').trim().toUpperCase();
    const name = String(row['Student Name'] || row['name'] || '').trim();
    const email = String(row['Email'] || row['email'] || '').trim().toLowerCase();
    const phone = String(row['Phone'] || row['phone'] || '').trim();
    const deptCode = String(row['Department Code'] || row['departmentCode'] || '').trim().toUpperCase();
    const courseCode = String(row['Course Code'] || row['courseCode'] || '').trim().toUpperCase();
    const year = String(row['Year'] || row['year'] || 'I Year').trim();
    const semester = String(row['Semester'] || row['semester'] || 'Semester 1').trim();
    const section = String(row['Section'] || row['section'] || 'A').trim().toUpperCase();
    const gender = String(row['Gender'] || row['gender'] || 'Female').trim();
    const dob = String(row['Date of Birth (YYYY-MM-DD)'] || row['dob'] || '2005-01-01').trim();
    const parentName = String(row['Parent Name'] || row['parentName'] || 'Parent').trim();
    const parentPhone = String(row['Parent Phone'] || row['parentPhone'] || '').trim();
    const address = String(row['Address'] || row['address'] || 'Tiruvannamalai').trim();

    // Required Field Validations
    if (!regNo) errors.push('Register Number is required');
    if (!rollNo) errors.push('Roll Number is required');
    if (!name) errors.push('Student Name is required');
    if (!email) errors.push('Email is required');
    if (!phone) errors.push('Phone is required');
    if (!deptCode) errors.push('Department Code is required');
    if (!courseCode) errors.push('Course Code is required');

    // Duplicate Check - Database
    if (regNo && existingRegNumbers.has(regNo)) {
      errors.push(`Duplicate: Register Number "${regNo}" already exists in database`);
    }
    if (email && existingEmails.has(email)) {
      errors.push(`Duplicate: Email "${email}" already exists in database`);
    }

    // Duplicate Check - Within Current Upload Batch
    if (regNo && seenInBatchRegs.has(regNo)) {
      errors.push(`Duplicate in file: Register Number "${regNo}" appears multiple times`);
    } else if (regNo) {
      seenInBatchRegs.add(regNo);
    }

    if (email && seenInBatchEmails.has(email)) {
      errors.push(`Duplicate in file: Email "${email}" appears multiple times`);
    } else if (email) {
      seenInBatchEmails.add(email);
    }

    // Foreign Key Reference Checks
    const matchedDept = deptMap.get(deptCode);
    if (deptCode && !matchedDept) {
      errors.push(`Invalid Department Code: "${deptCode}" not found in system`);
    }

    const matchedCourse = courseMap.get(courseCode);
    if (courseCode && !matchedCourse) {
      errors.push(`Invalid Course Code: "${courseCode}" not found in system`);
    }

    const processedData = {
      studentId: `STU-${regNo || Math.floor(1000 + Math.random() * 9000)}`,
      registerNumber: regNo,
      rollNumber: rollNo,
      name,
      dob,
      gender,
      email,
      phone,
      address,
      department: matchedDept ? matchedDept._id : null,
      departmentCode: deptCode,
      course: matchedCourse ? matchedCourse._id : null,
      courseCode,
      year,
      semester,
      section,
      parentName,
      parentPhone,
      status: 'Active',
    };

    if (errors.length > 0) {
      errorRecords.push({
        rowNumber: rowNum,
        data: processedData,
        raw: row,
        errors,
      });
    } else {
      validRecords.push({
        rowNumber: rowNum,
        data: processedData,
      });
    }
  }

  return {
    totalRows: rawRows.length,
    validCount: validRecords.length,
    errorCount: errorRecords.length,
    validRecords,
    errorRecords,
  };
}

/**
 * Parse & Validate Faculty Excel Sheet
 */
async function validateAndParseFacultyExcel(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The uploaded Excel sheet contains no data rows.');
  }

  const [departments, existingFaculty] = await Promise.all([
    Department.find({}, 'code _id name'),
    Faculty.find({}, 'employeeId email'),
  ]);

  const deptMap = new Map();
  departments.forEach((d) => deptMap.set(d.code.toUpperCase(), d));

  const existingEmpIds = new Set(existingFaculty.map((f) => f.employeeId.toUpperCase()));
  const existingEmails = new Set(existingFaculty.map((f) => f.email.toLowerCase()));

  const seenInBatchEmpIds = new Set();
  const seenInBatchEmails = new Set();

  const validRecords = [];
  const errorRecords = [];

  for (let i = 0; i < rawRows.length; i++) {
    const rowNum = i + 2;
    const row = rawRows[i];
    const errors = [];

    const empId = String(row['Employee ID'] || row['employeeId'] || '').trim().toUpperCase();
    const name = String(row['Faculty Name'] || row['name'] || '').trim();
    const qualification = String(row['Qualification'] || row['qualification'] || '').trim();
    const designation = String(row['Designation'] || row['designation'] || 'Assistant Professor').trim();
    const deptCode = String(row['Department Code'] || row['departmentCode'] || '').trim().toUpperCase();
    const email = String(row['Email'] || row['email'] || '').trim().toLowerCase();
    const phone = String(row['Phone'] || row['phone'] || '').trim();
    const experience = String(row['Experience'] || row['experience'] || '1 Year').trim();
    const specialization = String(row['Specialization'] || row['specialization'] || 'General').trim();

    if (!empId) errors.push('Employee ID is required');
    if (!name) errors.push('Faculty Name is required');
    if (!qualification) errors.push('Qualification is required');
    if (!deptCode) errors.push('Department Code is required');
    if (!email) errors.push('Email is required');
    if (!phone) errors.push('Phone is required');

    if (empId && existingEmpIds.has(empId)) {
      errors.push(`Duplicate: Employee ID "${empId}" already exists in database`);
    }
    if (email && existingEmails.has(email)) {
      errors.push(`Duplicate: Email "${email}" already exists in database`);
    }

    if (empId && seenInBatchEmpIds.has(empId)) {
      errors.push(`Duplicate in file: Employee ID "${empId}" appears multiple times`);
    } else if (empId) {
      seenInBatchEmpIds.add(empId);
    }

    if (email && seenInBatchEmails.has(email)) {
      errors.push(`Duplicate in file: Email "${email}" appears multiple times`);
    } else if (email) {
      seenInBatchEmails.add(email);
    }

    const matchedDept = deptMap.get(deptCode);
    if (deptCode && !matchedDept) {
      errors.push(`Invalid Department Code: "${deptCode}" not found`);
    }

    const processedData = {
      facultyId: `FAC-${empId || Math.floor(1000 + Math.random() * 9000)}`,
      employeeId: empId,
      name,
      qualification,
      designation,
      department: matchedDept ? matchedDept._id : null,
      departmentCode: deptCode,
      email,
      phone,
      experience,
      specialization,
      status: 'Active',
    };

    if (errors.length > 0) {
      errorRecords.push({
        rowNumber: rowNum,
        data: processedData,
        raw: row,
        errors,
      });
    } else {
      validRecords.push({
        rowNumber: rowNum,
        data: processedData,
      });
    }
  }

  return {
    totalRows: rawRows.length,
    validCount: validRecords.length,
    errorCount: errorRecords.length,
    validRecords,
    errorRecords,
  };
}

/**
 * Parse & Validate Marks Excel Sheet
 */
async function validateAndParseMarksExcel(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The uploaded Excel sheet contains no data rows.');
  }

  const [students, subjects] = await Promise.all([
    Student.find({}, 'registerNumber name department course'),
    Subject.find({}, 'subjectCode subjectName course department semester'),
  ]);

  const studentMap = new Map();
  students.forEach((s) => studentMap.set(s.registerNumber.toUpperCase(), s));

  const subjectMap = new Map();
  subjects.forEach((sub) => subjectMap.set(sub.subjectCode.toUpperCase(), sub));

  const validRecords = [];
  const errorRecords = [];
  const seenMarks = new Set();

  for (let i = 0; i < rawRows.length; i++) {
    const rowNum = i + 2;
    const row = rawRows[i];
    const errors = [];

    const regNo = String(row['Register Number'] || row['registerNumber'] || '').trim().toUpperCase();
    const subjectCode = String(row['Subject Code'] || row['subjectCode'] || '').trim().toUpperCase();
    const semester = String(row['Semester'] || row['semester'] || 'Semester 1').trim();
    const rawInternal = row['Internal Mark (Max 25)'] !== undefined ? row['Internal Mark (Max 25)'] : row['internalMark'];
    const rawExternal = row['External Mark (Max 75)'] !== undefined ? row['External Mark (Max 75)'] : row['externalMark'];

    const internalMark = Number(rawInternal);
    const externalMark = Number(rawExternal);

    if (!regNo) errors.push('Register Number is required');
    if (!subjectCode) errors.push('Subject Code is required');

    if (isNaN(internalMark) || internalMark < 0 || internalMark > 25) {
      errors.push('Internal Mark must be a valid number between 0 and 25');
    }

    if (isNaN(externalMark) || externalMark < 0 || externalMark > 75) {
      errors.push('External Mark must be a valid number between 0 and 75');
    }

    const matchedStudent = studentMap.get(regNo);
    if (regNo && !matchedStudent) {
      errors.push(`Student with Register Number "${regNo}" not found`);
    }

    const matchedSubject = subjectMap.get(subjectCode);
    if (subjectCode && !matchedSubject) {
      errors.push(`Subject with Code "${subjectCode}" not found`);
    }

    const markKey = `${regNo}_${subjectCode}_${semester}`;
    if (seenMarks.has(markKey)) {
      errors.push(`Duplicate entry for ${regNo} in subject ${subjectCode} in this sheet`);
    } else {
      seenMarks.add(markKey);
    }

    const total = (isNaN(internalMark) ? 0 : internalMark) + (isNaN(externalMark) ? 0 : externalMark);
    const isPassed = externalMark >= 30 && total >= 40;
    let grade = 'RA';
    if (isPassed) {
      if (total >= 90) grade = 'O';
      else if (total >= 80) grade = 'A+';
      else if (total >= 70) grade = 'A';
      else if (total >= 60) grade = 'B+';
      else if (total >= 50) grade = 'B';
      else grade = 'C';
    }

    const processedData = {
      student: matchedStudent ? matchedStudent._id : null,
      registerNumber: regNo,
      studentName: matchedStudent ? matchedStudent.name : (row['Student Name'] || ''),
      department: matchedStudent ? matchedStudent.department : null,
      course: matchedStudent ? matchedStudent.course : null,
      semester,
      subject: matchedSubject ? matchedSubject._id : null,
      subjectCode,
      subjectName: matchedSubject ? matchedSubject.subjectName : '',
      internalMark,
      externalMark,
      totalMark: total,
      percentage: total,
      grade,
      resultStatus: isPassed ? 'Pass' : 'Fail',
    };

    if (errors.length > 0) {
      errorRecords.push({
        rowNumber: rowNum,
        data: processedData,
        raw: row,
        errors,
      });
    } else {
      validRecords.push({
        rowNumber: rowNum,
        data: processedData,
      });
    }
  }

  return {
    totalRows: rawRows.length,
    validCount: validRecords.length,
    errorCount: errorRecords.length,
    validRecords,
    errorRecords,
  };
}

module.exports = {
  generateStudentTemplate,
  generateFacultyTemplate,
  generateMarksTemplate,
  validateAndParseStudentExcel,
  validateAndParseFacultyExcel,
  validateAndParseMarksExcel,
};
