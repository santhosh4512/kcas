const Event = require('../models/Event');
const Student = require('../models/Student');
const AuditLog = require('../models/AuditLog');

/**
 * @desc Get all events
 * @route GET /api/events
 */
exports.getEvents = async (req, res, next) => {
  try {
    const { type, status, department, search } = req.query;
    const filter = {};

    if (type && type !== 'all') filter.type = type;
    if (status && status !== 'all') filter.status = status;
    if (department) filter.department = department;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(filter)
      .sort({ eventDate: 1, createdAt: -1 })
      .populate('department', 'name code')
      .populate('coordinator', 'name designation email');

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get single event
 * @route GET /api/events/:id
 */
exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('department', 'name code')
      .populate('coordinator', 'name designation email')
      .populate('participants.student', 'name registerNumber email phone department');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Create new event
 * @route POST /api/events
 */
exports.createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body);

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        performedBy: req.user._id,
        performerName: req.user.name,
        performerRole: req.user.role,
        action: 'CREATE_EVENT',
        module: 'Events',
        description: `Created event: "${event.title}" on ${event.eventDate}`,
        ipAddress: req.ip || '',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Update event
 * @route PUT /api/events/:id
 */
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Delete event
 * @route DELETE /api/events/:id
 */
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Register a student for an event (1-Click Student Registration)
 * @route POST /api/events/:id/register
 */
exports.registerStudentForEvent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const targetStudentId = studentId || (req.user && req.user.referenceId);

    if (!targetStudentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required for registration' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const student = await Student.findById(targetStudentId).populate('department');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Check if already registered
    const isAlreadyRegistered = event.participants.some(
      (p) => p.student.toString() === student._id.toString() && p.status !== 'Cancelled'
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({ success: false, message: 'Student is already registered for this event' });
    }

    // Check capacity
    const activeParticipantsCount = event.participants.filter((p) => p.status !== 'Cancelled').length;
    if (activeParticipantsCount >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Event has reached maximum participant capacity' });
    }

    event.participants.push({
      student: student._id,
      studentName: student.name,
      registerNumber: student.registerNumber,
      departmentName: student.department ? student.department.name : '',
      registeredAt: new Date(),
      status: 'Registered',
    });

    await event.save();

    res.status(200).json({
      success: true,
      message: `Successfully registered ${student.name} for ${event.title}!`,
      data: event,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Cancel registration for an event
 * @route POST /api/events/:id/cancel-registration
 */
exports.cancelRegistration = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const targetStudentId = studentId || (req.user && req.user.referenceId);

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const participantIndex = event.participants.findIndex(
      (p) => p.student.toString() === targetStudentId.toString()
    );

    if (participantIndex === -1) {
      return res.status(400).json({ success: false, message: 'Student registration record not found' });
    }

    event.participants[participantIndex].status = 'Cancelled';
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully',
      data: event,
    });
  } catch (err) {
    next(err);
  }
};
