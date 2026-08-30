const express = require('express');
const router = express.Router();
const { getReportData } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/:reportType', getReportData);

module.exports = router;
