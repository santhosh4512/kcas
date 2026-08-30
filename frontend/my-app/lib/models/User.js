import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
    profilePhoto: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password prior to saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);
