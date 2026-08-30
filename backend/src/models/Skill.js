const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    registerNumber: {
      type: String,
      required: true,
      uppercase: true,
    },
    skillName: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Skill category is required'],
      enum: ['Studies', 'Sports', 'Arts & Culture', 'Technical Skills', 'Communication', 'Leadership', 'Other Skills'],
      default: 'Technical Skills',
    },
    skillLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'],
      default: 'Intermediate',
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 75,
    },
    experience: {
      type: String,
      default: '1 Year',
    },
    achievement: {
      type: String,
      default: '',
    },
    certificate: {
      type: String,
      default: '',
    },
    passion: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

skillSchema.index({ student: 1, category: 1 });
skillSchema.index({ registerNumber: 1, skillName: 1 });

module.exports = mongoose.model('Skill', skillSchema);
