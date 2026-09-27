const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Notice content is required'],
    },
    category: {
      type: String,
      enum: ['Circular', 'Exam', 'Event', 'Deadline', 'Holiday', 'Placement', 'General'],
      default: 'General',
    },
    priority: {
      type: String,
      enum: ['Urgent', 'High', 'Normal', 'Low'],
      default: 'Normal',
    },
    targetAudience: {
      type: String,
      enum: ['All', 'Students', 'Faculty', 'Department'],
      default: 'All',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postedByName: {
      type: String,
      default: 'College Administration',
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
      },
    ],
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

noticeSchema.index({ category: 1, priority: 1, isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
