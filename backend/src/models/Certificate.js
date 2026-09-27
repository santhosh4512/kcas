const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Certificate title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Technical', 'Sports', 'Cultural', 'Academic', 'Workshop', 'Internship', 'Online MOOC', 'Leadership', 'Other'],
      default: 'Technical',
    },
    issuer: {
      type: String,
      required: [true, 'Issuer organization/institution is required'],
      default: 'NPTEL / Coursera / College',
    },
    issueDate: {
      type: String, // YYYY-MM-DD
      default: () => new Date().toISOString().split('T')[0],
    },
    expiryDate: {
      type: String,
      default: '',
    },
    credentialId: {
      type: String,
      default: '',
    },
    credentialUrl: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    pointsAwarded: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ student: 1, category: 1, verificationStatus: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
