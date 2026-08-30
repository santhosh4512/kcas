const express = require('express');
const {
  login,
  publicRegister,
  changeFirstPassword,
  changePassword,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register-public', publicRegister);
router.post('/login', login);
router.post('/change-first-password', protect, changeFirstPassword);
router.post('/change-password', protect, changePassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
