const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'profile-' + uniqueSuffix + ext);
  },
});

// File filter for images (JPG, JPEG, PNG, WebP)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image file format. Only JPG, JPEG, PNG, and WebP are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

/**
 * @desc    Upload profile photo (Faculty, Staff, Admin)
 * @route   POST /api/upload/image
 * @access  Private
 */
router.post('/image', protect, upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded.',
      });
    }

    const fileUrl = `/uploads/profiles/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Image upload failed',
    });
  }
});

module.exports = router;
