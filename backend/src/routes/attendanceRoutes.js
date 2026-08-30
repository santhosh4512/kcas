const express = require('express');
const router = express.Router();
const {
  getAttendanceSheet,
  saveAttendance,
  getAttendanceHistory,
  getAttendanceSummary,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/sheet', getAttendanceSheet);
router.post('/save', authorize('admin', 'faculty'), saveAttendance);
router.get('/history', getAttendanceHistory);
router.get('/summary', getAttendanceSummary);

module.exports = router;
