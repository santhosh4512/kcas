const express = require('express');
const router = express.Router();
const {
  getStudentReports,
  submitStudentReport,
  updateStudentReportStatus,
} = require('../controllers/studentReportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getStudentReports)
  .post(submitStudentReport);

router.route('/:id')
  .patch(authorize('admin', 'faculty'), updateStudentReportStatus);

module.exports = router;
