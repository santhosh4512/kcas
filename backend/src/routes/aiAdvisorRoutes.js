const express = require('express');
const router = express.Router();
const {
  getStudentAIAnalysis,
  getCohortAIInsights,
  dispatchAutomatedAlert,
} = require('../controllers/aiAdvisorController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/student/:id', getStudentAIAnalysis);
router.get('/cohort-insights', getCohortAIInsights);
router.post('/dispatch-alert', dispatchAutomatedAlert);

module.exports = router;
