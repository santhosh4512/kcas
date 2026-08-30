const express = require('express');
const {
  getStaffAccounts,
  createStaffAccount,
  updateStaffAccount,
  resetStaffPassword,
  toggleStaffStatus,
} = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All staff account endpoints are strictly restricted to Admin
router.use(protect);
router.use(authorize('admin'));

router.route('/').get(getStaffAccounts).post(createStaffAccount);
router.route('/:id').put(updateStaffAccount);
router.route('/:id/reset-password').post(resetStaffPassword);
router.route('/:id/toggle-status').patch(toggleStaffStatus);

module.exports = router;
