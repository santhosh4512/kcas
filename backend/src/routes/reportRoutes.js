const express = require('express');
const router = express.Router();
const { getReportData, getStudentProgressReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/student-progress/:studentId', getStudentProgressReport);
router.get('/:reportType', getReportData);

module.exports = router;
