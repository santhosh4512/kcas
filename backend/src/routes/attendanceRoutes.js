const express = require('express');
const router = express.Router();
const {
  getAttendanceSheet,
  saveAttendance,
  getAttendanceHistory,
  getAttendanceSummary,
  submitGeoCheckin,
  manualOverrideAttendance,
  getGeoCheckinLogs,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/sheet', getAttendanceSheet);
router.post('/save', authorize('admin', 'faculty'), saveAttendance);
router.post('/geo-checkin', submitGeoCheckin);
router.post('/override', authorize('admin', 'faculty'), manualOverrideAttendance);
router.get('/geo-logs', getGeoCheckinLogs);
router.get('/history', getAttendanceHistory);
router.get('/summary', getAttendanceSummary);

module.exports = router;
