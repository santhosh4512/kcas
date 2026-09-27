const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    studentName: String,
    registerNumber: String,
    departmentName: String,
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Registered', 'Attended', 'Cancelled'],
      default: 'Registered',
    },
  },
  { _id: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Seminar', 'Workshop', 'Hackathon', 'Competition', 'Cultural', 'Sports', 'Symposium', 'Webinar'],
      default: 'Workshop',
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    eventDate: {
      type: String, // YYYY-MM-DD
      required: [true, 'Event date is required'],
    },
    startTime: {
      type: String,
      default: '09:30 AM',
    },
    endTime: {
      type: String,
      default: '04:30 PM',
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      default: 'Main Auditorium / Lab 3',
    },
    organizer: {
      type: String,
      default: 'Department of Computer Science',
    },
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      default: null,
    },
    maxParticipants: {
      type: Number,
      default: 100,
    },
    registrationDeadline: {
      type: String, // YYYY-MM-DD
      default: '',
    },
    participants: [participantSchema],
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    },
    bannerUrl: {
      type: String,
      default: '',
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ eventDate: 1, type: 1, status: 1 });

module.exports = mongoose.model('Event', eventSchema);
