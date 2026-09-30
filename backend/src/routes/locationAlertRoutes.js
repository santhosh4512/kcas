const express = require('express');
const {
  getLocationAlerts,
  getLocationAlertById,
  updateLocationAlertStatus,
} = require('../controllers/locationAlertController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getLocationAlerts);
router.get('/:id', getLocationAlertById);
router.patch('/:id/status', updateLocationAlertStatus);

module.exports = router;
