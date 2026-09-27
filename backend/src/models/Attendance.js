const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    registerNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'On Duty', 'Leave'],
      default: 'Present',
    },
    remarks: {
      type: String,
      default: '',
    },
    isGeoVerified: {
      type: Boolean,
      default: false,
    },
    verificationMethod: {
      type: String,
      enum: ['GPS_CAMPUS', 'MANUAL_FACULTY', 'DAILY_SELF_REQUEST', 'OVERRIDE'],
      default: 'MANUAL_FACULTY',
    },
    geoCoordinates: {
      latitude: Number,
      longitude: Number,
      distanceMeters: Number,
    },
    isOverridden: {
      type: Boolean,
      default: false,
    },
    originalStatus: {
      type: String,
      default: '',
    },
    overrideReason: {
      type: String,
      default: '',
    },
    overriddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    overriddenAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
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
    year: {
      type: String,
      required: true,
      enum: ['I Year', 'II Year', 'III Year', 'IV Year'],
    },
    semester: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      default: 'A',
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD format
      required: true,
    },
    records: [attendanceRecordSchema],
    totalStudents: {
      type: Number,
      default: 0,
    },
    presentCount: {
      type: Number,
      default: 0,
    },
    absentCount: {
      type: Number,
      default: 0,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ department: 1, course: 1, subject: 1, date: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
