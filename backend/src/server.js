// 1. Load environment variables FIRST before any module imports
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const corsOptions = {
  origin: true, // Allow all incoming origins (Vercel, Render, local, custom domains)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Disposition'],
  optionsSuccessStatus: 204,
};

// Enable CORS & preflight
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static profile uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check route (Section 10 Requirement)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running',
    environment: process.env.NODE_ENV || 'development',
    institution: 'Kamban College of Arts and Science for Women',
    timestamp: new Date().toISOString(),
  });
});

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
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/warnings', require('./routes/warningRoutes'));
app.use('/api/mentor', require('./routes/mentorRoutes'));
app.use('/api/ai-advisor', require('./routes/aiAdvisorRoutes'));
app.use('/api/location-alerts', require('./routes/locationAlertRoutes'));
app.use('/api/settings', require('./routes/systemSettingRoutes'));
app.use('/api/backup', require('./routes/backupRoutes'));
app.use('/api/faculty-workload', require('./routes/facultyWorkloadRoutes'));
app.use('/api/student-reports', require('./routes/studentReportRoutes'));

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
