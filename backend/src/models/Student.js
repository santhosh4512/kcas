const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    registerNumber: {
      type: String,
      required: [true, 'Register number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    dob: {
      type: String,
      default: '2004-01-01',
    },
    gender: {
      type: String,
      default: 'Female',
      enum: ['Female', 'Male', 'Other'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    address: {
      type: String,
      default: 'Tiruvannamalai, Tamil Nadu',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    year: {
      type: String,
      required: [true, 'Year is required'],
      enum: ['I Year', 'II Year', 'III Year', 'IV Year'],
      default: 'I Year',
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      enum: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'],
      default: 'Semester 1',
    },
    section: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      default: 'A',
    },
    admissionYear: {
      type: Number,
      default: 2024,
    },
    parentName: {
      type: String,
      default: 'Parent / Guardian',
    },
    parentPhone: {
      type: String,
      default: '',
    },
    photoUrl: {
      type: String,
      default: '',
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Graduated', 'Discontinued', 'Suspended'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.index({ registerNumber: 1, rollNumber: 1, department: 1, year: 1, section: 1 });

module.exports = mongoose.model('Student', studentSchema);
