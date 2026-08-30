const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    departmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    hod: {
      type: String,
      required: [true, 'HOD name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
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

departmentSchema.index({ name: 1, code: 1 });

module.exports = mongoose.model('Department', departmentSchema);
