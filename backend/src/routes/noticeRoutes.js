const express = require('express');
const router = express.Router();
const {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
} = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getNotices)
  .post(protect, authorize('admin', 'faculty'), createNotice);

router.route('/:id')
  .get(getNoticeById)
  .put(protect, authorize('admin', 'faculty'), updateNotice)
  .delete(protect, authorize('admin', 'faculty'), deleteNotice);

module.exports = router;
