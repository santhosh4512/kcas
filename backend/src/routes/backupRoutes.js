const express = require('express');
const { exportBackup, restoreBackup } = require('../controllers/backupController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/export', exportBackup);
router.post('/restore', restoreBackup);

module.exports = router;
