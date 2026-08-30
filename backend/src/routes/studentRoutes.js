const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentProfile,
  createStudent,
  updateStudent,
  deleteStudent,
  downloadTemplate,
  previewExcel,
  importStudents,
  exportStudents,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const { uploadExcel } = require('../middleware/upload');

router.use(protect);

router.get('/template', downloadTemplate);
router.get('/export', exportStudents);
router.post('/preview-excel', authorize('admin', 'faculty'), uploadExcel.single('file'), previewExcel);
router.post('/import', authorize('admin', 'faculty'), importStudents);

router.route('/').get(getStudents).post(authorize('admin', 'faculty'), createStudent);
router
  .route('/:id')
  .get(getStudentProfile)
  .put(authorize('admin', 'faculty'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

module.exports = router;
