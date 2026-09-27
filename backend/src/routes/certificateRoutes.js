const express = require('express');
const router = express.Router();
const {
  getCertificates,
  getCertificateById,
  createCertificate,
  verifyCertificate,
  deleteCertificate,
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getCertificates)
  .post(protect, createCertificate);

router.route('/:id')
  .get(protect, getCertificateById)
  .delete(protect, deleteCertificate);

router.patch('/:id/verify', protect, authorize('admin', 'faculty'), verifyCertificate);

module.exports = router;
