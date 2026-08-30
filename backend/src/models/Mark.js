const mongoose = require('mongoose');

const markSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    registerNumber: {
      type: String,
      required: [true, 'Register number is required'],
      trim: true,
      uppercase: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    subjectCode: {
      type: String,
      required: true,
      uppercase: true,
    },
    subjectName: {
      type: String,
      required: true,
    },
    internalMark: {
      type: Number,
      required: true,
      min: 0,
      max: 25,
      default: 0,
    },
    externalMark: {
      type: Number,
      required: true,
      min: 0,
      max: 75,
      default: 0,
    },
    totalMark: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    grade: {
      type: String,
      enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'U', 'RA', 'AB'],
      default: 'U',
    },
    resultStatus: {
      type: String,
      enum: ['Pass', 'Fail', 'Absent'],
      default: 'Fail',
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate total, percentage, grade, and pass/fail result
markSchema.pre('save', function (next) {
  this.totalMark = Number(this.internalMark || 0) + Number(this.externalMark || 0);
  this.percentage = this.totalMark;

  // Grade calculation (Thiruvalluvar University standard)
  // Internal min usually 10/25, External min 30/75, Total >= 40 for Pass
  const isPassed = this.externalMark >= 30 && this.totalMark >= 40;

  if (!isPassed) {
    this.grade = 'RA'; // Re-Appear
    this.resultStatus = 'Fail';
  } else {
    this.resultStatus = 'Pass';
    if (this.totalMark >= 90) this.grade = 'O';
    else if (this.totalMark >= 80) this.grade = 'A+';
    else if (this.totalMark >= 70) this.grade = 'A';
    else if (this.totalMark >= 60) this.grade = 'B+';
    else if (this.totalMark >= 50) this.grade = 'B';
    else this.grade = 'C';
  }

  next();
});

markSchema.index({ student: 1, subject: 1, semester: 1 }, { unique: true });
markSchema.index({ registerNumber: 1, subjectCode: 1, semester: 1 });

module.exports = mongoose.model('Mark', markSchema);
