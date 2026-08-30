const multer = require('multer');
const path = require('path');

// Store file in memory buffer for fast SheetJS parsing without disk clutter
const storage = multer.memoryStorage();

const excelFilter = (req, file, cb) => {
  const allowedExtensions = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (
    allowedExtensions.includes(ext) ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.mimetype === 'text/csv'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Excel (.xlsx, .xls) and CSV files are allowed.'), false);
  }
};

const uploadExcel = multer({
  storage,
  fileFilter: excelFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = { uploadExcel };
