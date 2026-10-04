const mongoose = require('mongoose');

const talentScoreSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true,
    },
    registerNumber: {
      type: String,
      required: true,
      uppercase: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      default: 'Semester 1',
    },
    section: {
      type: String,
      default: 'A',
    },
    categoryScores: {
      studies: { type: Number, min: 0, max: 100, default: 0 },
      sports: { type: Number, min: 0, max: 100, default: 0 },
      silambam: { type: Number, min: 0, max: 100, default: 0 },
      dance: { type: Number, min: 0, max: 100, default: 0 },
      cultural: { type: Number, min: 0, max: 100, default: 0 },
      technical: { type: Number, min: 0, max: 100, default: 0 },
      communication: { type: Number, min: 0, max: 100, default: 0 },
      leadership: { type: Number, min: 0, max: 100, default: 0 },
      other: { type: Number, min: 0, max: 100, default: 0 },
    },
    primaryTalent: [
      {
        category: String,
        displayName: String,
        score: Number,
      },
    ],
    secondaryStrength: [
      {
        category: String,
        displayName: String,
        score: Number,
      },
    ],
    rankedCategories: [
      {
        category: String,
        displayName: String,
        score: Number,
        rank: Number,
      },
    ],
    highestScore: {
      type: Number,
      default: 0,
    },
    dominantCategoryName: {
      type: String,
      default: 'Studies',
    },
    isJointHighest: {
      type: Boolean,
      default: false,
    },
    suggestions: [
      {
        type: String,
      },
    ],
    calculatedSummary: {
      type: String,
      default: '',
    },
    evaluatorNotes: {
      type: String,
      default: '',
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

talentScoreSchema.index({ department: 1, year: 1, dominantCategoryName: 1 });
talentScoreSchema.index({ registerNumber: 1 });

module.exports = mongoose.model('TalentScore', talentScoreSchema);
