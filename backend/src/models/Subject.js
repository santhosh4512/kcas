const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    subjectId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    subjectCode: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    subjectName: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      enum: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'],
    },
    credits: {
      type: Number,
      default: 4,
      min: 1,
      max: 10,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

subjectSchema.index({ subjectCode: 1, course: 1, semester: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
