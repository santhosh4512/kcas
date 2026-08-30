const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
    },
    duration: {
      type: String,
      default: '3 Years (6 Semesters)',
    },
    courseType: {
      type: String,
      enum: ['Undergraduate (UG)', 'Postgraduate (PG)', 'Diploma', 'Certificate'],
      default: 'Undergraduate (UG)',
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

courseSchema.index({ courseCode: 1, department: 1 });

module.exports = mongoose.model('Course', courseSchema);
