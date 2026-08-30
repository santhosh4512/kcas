const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    entityId: {
      type: String,
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    performerName: {
      type: String,
      default: 'System',
    },
    performerRole: {
      type: String,
      default: 'admin',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

auditLogSchema.index({ module: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
