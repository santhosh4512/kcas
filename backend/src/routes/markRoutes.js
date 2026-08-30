const express = require('express');
const router = express.Router();
const {
  getMarks,
  saveMark,
  batchSaveMarks,
  getStudentMarks,
  deleteMark,
  downloadTemplate,
  previewExcel,
  importMarks,
  exportMarks,
} = require('../controllers/markController');
const { protect, authorize } = require('../middleware/auth');
const { uploadExcel } = require('../middleware/upload');

router.use(protect);

router.get('/template', downloadTemplate);
router.get('/export', exportMarks);
router.get('/student/:studentId', getStudentMarks);
router.post('/preview-excel', authorize('admin', 'faculty'), uploadExcel.single('file'), previewExcel);
router.post('/import', authorize('admin', 'faculty'), importMarks);
router.post('/batch', authorize('admin', 'faculty'), batchSaveMarks);

router.route('/').get(getMarks).post(authorize('admin', 'faculty'), saveMark);
router.route('/:id').delete(authorize('admin', 'faculty'), deleteMark);

module.exports = router;

