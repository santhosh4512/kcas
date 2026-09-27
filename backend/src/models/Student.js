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
      trim: true,
      uppercase: true,
      default: '',
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
      default: '',
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
      default: 'I Year',
    },
    semester: {
      type: String,
      default: 'Semester 1',
    },
    section: {
      type: String,
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
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      default: null,
    },
    mentorName: {
      type: String,
      default: '',
    },
    initialAttendance: {
      type: Number,
      default: 85,
    },
    initialMarks: {
      type: Number,
      default: 75,
    },
    skills: {
      type: [String],
      default: [],
    },
    achievements: {
      type: [String],
      default: [],
    },
    activities: {
      type: [String],
      default: [],
    },
    talents: [
      {
        category: String, // 'Sports', 'Coding', 'Cultural', 'Communication', 'Leadership', 'Extracurricular'
        skillName: String,
        proficiency: String, // 'Beginner', 'Intermediate', 'Advanced', 'Expert'
        achievements: String,
      },
    ],
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

studentSchema.index({ registerNumber: 1, department: 1, year: 1, section: 1 });

module.exports = mongoose.model('Student', studentSchema);

