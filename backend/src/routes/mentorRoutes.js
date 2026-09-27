const express = require('express');
const router = express.Router();
const {
  getMentorDashboard,
  assignMentor,
} = require('../controllers/mentorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, getMentorDashboard);
router.post('/assign', protect, authorize('admin', 'faculty'), assignMentor);

module.exports = router;
