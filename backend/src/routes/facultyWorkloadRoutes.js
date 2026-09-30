const express = require('express');
const { getFacultyWorkload } = require('../controllers/facultyWorkloadController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/', getFacultyWorkload);

module.exports = router;
