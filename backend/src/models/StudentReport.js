const mongoose = require('mongoose');

const studentReportSchema = new mongoose.Schema(
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
      default: null,
    },
    category: {
      type: String,
      enum: ['Attendance issue', 'Academic issue', 'Technical issue', 'Other request'],
      required: [true, 'Please select report category'],
    },
    title: {
      type: String,
      required: [true, 'Please provide issue title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide description of the issue'],
      trim: true,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Resolved', 'Rejected'],
      default: 'Submitted',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolverName: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

studentReportSchema.index({ student: 1, status: 1 });
studentReportSchema.index({ category: 1, date: 1 });

module.exports = mongoose.model('StudentReport', studentReportSchema);
