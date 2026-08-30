const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
  {
    facultyId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Faculty name is required'],
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    experience: {
      type: String,
      default: '2 Years',
    },
    specialization: {
      type: String,
      default: 'General',
    },
    assignedSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active',
    },
    profilePhoto: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

facultySchema.index({ employeeId: 1, email: 1, department: 1 });

module.exports = mongoose.model('Faculty', facultySchema);
