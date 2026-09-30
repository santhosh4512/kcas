const express = require('express');
const { getSettings, updateSettings } = require('../controllers/systemSettingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getSettings);
router.put('/', protect, authorize('admin'), updateSettings);

module.exports = router;
