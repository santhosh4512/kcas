const express = require('express');
const router = express.Router();
const {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getCourses).post(authorize('admin'), createCourse);
router
  .route('/:id')
  .put(authorize('admin'), updateCourse)
  .delete(authorize('admin'), deleteCourse);

module.exports = router;
