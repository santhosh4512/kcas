const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'faculty', 'student'],
      default: 'student',
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    employeeId: {
      type: String,
      default: '',
      uppercase: true,
      trim: true,
    },
    designation: {
      type: String,
      default: '',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'roleRefModel',
      default: null,
    },
    roleRefModel: {
      type: String,
      enum: ['Faculty', 'Student', null],
      default: null,
    },
    permissions: [
      {
        type: String,
        enum: [
          'view_students',
          'edit_students',
          'view_attendance',
          'manage_attendance',
          'view_marks',
          'manage_marks',
          'view_talent',
          'manage_talent',
          'view_reports',
          'export_reports',
        ],
      },
    ],
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
