const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerStudentForEvent,
  cancelRegistration,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getEvents)
  .post(protect, authorize('admin', 'faculty'), createEvent);

router.route('/:id')
  .get(getEventById)
  .put(protect, authorize('admin', 'faculty'), updateEvent)
  .delete(protect, authorize('admin', 'faculty'), deleteEvent);

router.post('/:id/register', protect, registerStudentForEvent);
router.post('/:id/cancel-registration', protect, cancelRegistration);

module.exports = router;
