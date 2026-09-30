const mongoose = require('mongoose');

const locationAlertSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    registerNumber: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    year: {
      type: String,
      default: '',
    },
    semester: {
      type: String,
      default: '',
    },
    section: {
      type: String,
      default: 'A',
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      default: null,
    },
    facultyName: {
      type: String,
      default: 'Unassigned / System Admin',
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },
    userCoordinates: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      accuracy: {
        type: Number,
        default: 10,
      },
    },
    campusCoordinates: {
      latitude: {
        type: Number,
        default: 12.1905865,
      },
      longitude: {
        type: Number,
        default: 79.0837848,
      },
    },
    distanceFromCampusMeters: {
      type: Number,
      required: true,
    },
    allowedRadiusMeters: {
      type: Number,
      default: 1000,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    time: {
      type: String, // HH:MM:SS
      default: () => new Date().toLocaleTimeString(),
    },
    alertType: {
      type: String,
      default: 'GPS_OUTSIDE_CAMPUS',
    },
    locationStatus: {
      type: String,
      enum: ['Outside Campus', 'Location Unavailable', 'Pending Verification', 'Inside Campus'],
      default: 'Outside Campus',
    },
    attendanceAttemptStatus: {
      type: String,
      default: 'Outside Campus - Not Automatically Marked',
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Unread', 'Read', 'Under Review', 'Resolved', 'Dismissed'],
      default: 'Unread',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedByName: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

locationAlertSchema.index({ faculty: 1, status: 1, date: -1 });
locationAlertSchema.index({ student: 1, date: -1 });

module.exports = mongoose.model('LocationAlert', locationAlertSchema);
