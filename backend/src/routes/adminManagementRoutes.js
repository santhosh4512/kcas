const express = require('express');
const {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  changeAdminPassword,
  toggleAdminStatus,
  deleteAdmin,
} = require('../controllers/adminManagementController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Strict Security: All routes below are private and accessible ONLY by authenticated users with role === 'admin'
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getAllAdmins)
  .post(createAdmin);

router.route('/:id')
  .get(getAdminById)
  .put(updateAdmin)
  .delete(deleteAdmin);

router.put('/:id/password', changeAdminPassword);
router.patch('/:id/toggle-status', toggleAdminStatus);

module.exports = router;
