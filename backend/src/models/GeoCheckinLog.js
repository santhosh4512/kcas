const mongoose = require('mongoose');

const geoCheckinLogSchema = new mongoose.Schema(
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
    studentName: {
      type: String,
      default: '',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    checkinTime: {
      type: String, // HH:MM:SS
      default: () => new Date().toLocaleTimeString(),
    },
    status: {
      type: String,
      enum: ['SUCCESS_IN_CAMPUS', 'FAILED_OUT_OF_CAMPUS', 'FAILED_PERMISSION_DENIED', 'FAILED_MOCK_LOCATION', 'MANUAL_OVERRIDE'],
      required: true,
    },
    attendanceStatus: {
      type: String,
      enum: ['Present', 'Absent', 'On Duty', 'Leave'],
      default: 'Present',
    },
    userCoordinates: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
    },
    campusCoordinates: {
      latitude: {
        type: Number,
        default: 12.2275, // Kamban College Tiruvannamalai campus coordinates
      },
      longitude: {
        type: Number,
        default: 79.0747,
      },
    },
    distanceFromCampusMeters: {
      type: Number,
      default: 0,
    },
    geofenceRadiusMeters: {
      type: Number,
      default: 1000, // 1000 meters campus geofence radius
    },
    failureReason: {
      type: String,
      default: '',
    },
    deviceInfo: {
      type: String,
      default: 'Web/Mobile Browser',
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

geoCheckinLogSchema.index({ student: 1, date: 1, status: 1 });

module.exports = mongoose.model('GeoCheckinLog', geoCheckinLogSchema);
