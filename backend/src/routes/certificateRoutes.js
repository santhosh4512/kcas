const express = require('express');
const router = express.Router();
const {
  getCertificates,
  getMyCertificates,
  getCertificateById,
  createCertificate,
  verifyCertificate,
  deleteCertificate,
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/me', getMyCertificates);
router.route('/')
  .get(getCertificates)
  .post(createCertificate);

router.route('/:id')
  .get(getCertificateById)
  .delete(authorize('admin', 'faculty'), deleteCertificate);

router.patch('/:id/verify', authorize('admin', 'faculty'), verifyCertificate);

module.exports = router;
