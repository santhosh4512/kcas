const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(`❌ API Error [${req.method} ${req.originalUrl}]:`, err);

  // Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with ID of ${err.value}`;
    return res.status(404).json({ success: false, message });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for "${field}". It must be unique.`;
    return res.status(400).json({ success: false, message });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return res.status(400).json({ success: false, message });
  }

  // Multer Error
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File size exceeds maximum limit of 10MB.' });
    }
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid session token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Session has expired, please log in again' });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
