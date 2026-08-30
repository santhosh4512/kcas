const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const path = require('path');

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
  });
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

async function startServer() {
  // 1. Connect to Database
  await connectDB();

  // 2. Perform idempotent database seeding and guarantee master admin
  try {
    const seedDatabase = require('./seed/seedData');
    await seedDatabase();
    const ensureDefaultAdmin = require('./seed/ensureAdmin');
    await ensureDefaultAdmin();
  } catch (err) {
    console.error('Seed check error:', err.message);
  }

  // 3. Start Express HTTP Server
  app.listen(PORT, () => {
    console.log(`\n===============================================================`);
    console.log(`🏛️  KAMBAN COLLEGE OF ARTS AND SCIENCE FOR WOMEN`);
    console.log(`🎯  Department Management & Student Talent Intelligence System`);
    console.log(`🌐  REST API Server running on port ${PORT}`);
    console.log(`⚡  API Base: http://localhost:${PORT}/api`);
    console.log(`===============================================================\n`);
  });
}

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = app;
