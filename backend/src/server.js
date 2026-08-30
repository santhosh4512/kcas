// 1. Load environment variables FIRST before any module imports
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Enable CORS
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('*', cors());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static profile uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/marks', require('./routes/markRoutes'));
app.use('/api/talent', require('./routes/talentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/admins', require('./routes/adminManagementRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/audit-logs', require('./routes/auditLogRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'KCAS Department Management API is running smoothly',
    timestamp: new Date().toISOString(),
    institution: 'Kamban College of Arts and Science for Women',
    database: 'kcas_department_db',
  });
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    // 1. Connect to Database (Awaited before anything else)
    await connectDB();

    // 2. Perform idempotent database seeding
    const seedDatabase = require('./seed/seedData');
    await seedDatabase();

    // 3. Verify Master Administrator Account
    const ensureDefaultAdmin = require('./seed/ensureAdmin');
    await ensureDefaultAdmin();

    // 4. Start Express HTTP Server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`⚡ API Base: http://localhost:${PORT}/api\n`);
    });
  } catch (err) {
    console.error('❌ Server startup failure:', err.message);
    process.exit(1);
  }
}

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = app;
