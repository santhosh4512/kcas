const express = require('express');
const router = express.Router();
const {
  getWarningAlerts,
  runEarlyWarningScan,
  updateWarningAction,
} = require('../controllers/warningController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getWarningAlerts);

router.post('/scan', protect, authorize('admin', 'faculty'), runEarlyWarningScan);
router.patch('/:id/action', protect, authorize('admin', 'faculty'), updateWarningAction);

module.exports = router;
