const express = require('express');
const router = express.Router();
const {
  getTalentList,
  getStudentTalentProfile,
  evaluateStudentTalent,
  addSkill,
  deleteSkill,
} = require('../controllers/talentController');
const { getDepartmentTalentAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getTalentList);
router.get('/analytics', getDepartmentTalentAnalytics);
router.get('/student/:studentId', getStudentTalentProfile);
router.post('/evaluate', authorize('admin', 'faculty'), evaluateStudentTalent);
router.post('/skill', authorize('admin', 'faculty'), addSkill);
router.delete('/skill/:id', authorize('admin', 'faculty'), deleteSkill);

module.exports = router;
