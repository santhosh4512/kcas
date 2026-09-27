const mongoose = require('mongoose');

const warningAlertSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    studentName: String,
    registerNumber: String,
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
    },
    alertType: {
      type: String,
      enum: ['Low Attendance', 'Academic Decline', 'Multiple Arrears', 'Consecutive Absence', 'Low Talent Score', 'Behavioral Concern', 'Custom'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Moderate', 'Low'],
      default: 'Moderate',
    },
    attendancePercentage: {
      type: Number,
      default: 0,
    },
    failedSubjectsCount: {
      type: Number,
      default: 0,
    },
    currentGpa: {
      type: Number,
      default: 0,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Under Review', 'Parent Contacted', 'Remedial Action', 'Resolved'],
      default: 'Active',
    },
    actionTaken: {
      type: String,
      default: '',
    },
    mentorNotes: [
      {
        note: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        authorName: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

warningAlertSchema.index({ student: 1, alertType: 1, status: 1, severity: 1 });

module.exports = mongoose.model('WarningAlert', warningAlertSchema);
