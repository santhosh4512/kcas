const express = require('express');
const router = express.Router();
const {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  downloadTemplate,
  previewExcel,
  importFaculty,
  exportFaculty,
} = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/auth');
const { uploadExcel } = require('../middleware/upload');

router.use(protect);

router.get('/template', downloadTemplate);
router.get('/export', exportFaculty);
router.post('/preview-excel', authorize('admin'), uploadExcel.single('file'), previewExcel);
router.post('/import', authorize('admin'), importFaculty);

router.route('/').get(getFaculty).post(authorize('admin'), createFaculty);
router
  .route('/:id')
  .get(getFacultyById)
  .put(authorize('admin'), updateFaculty)
  .delete(authorize('admin'), deleteFaculty);

module.exports = router;
