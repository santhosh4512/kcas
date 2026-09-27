const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const TalentScore = require('../models/TalentScore');
const Certificate = require('../models/Certificate');
const Event = require('../models/Event');
const Notice = require('../models/Notice');
const WarningAlert = require('../models/WarningAlert');
const GeoCheckinLog = require('../models/GeoCheckinLog');
const Faculty = require('../models/Faculty');
const Skill = require('../models/Skill');

async function purgeDemoData() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kcas_cdms';
  console.log('Connecting to MongoDB at:', MONGO_URI);
  await mongoose.connect(MONGO_URI);

  console.log('🧹 Purging all demo student, marks, attendance, certificates, events, and notices...');

  // Keep admin accounts, delete student & demo faculty users
  const adminUsers = await User.find({ role: 'admin' });
  console.log(`Preserving ${adminUsers.length} admin accounts.`);

  await Student.deleteMany({});
  await Attendance.deleteMany({});
  await Mark.deleteMany({});
  await TalentScore.deleteMany({});
  await Certificate.deleteMany({});
  await Event.deleteMany({});
  await Notice.deleteMany({});
  await WarningAlert.deleteMany({});
  await GeoCheckinLog.deleteMany({});
  await Skill.deleteMany({});
  await Faculty.deleteMany({});

  // Delete non-admin users
  await User.deleteMany({ role: { $ne: 'admin' } });

  console.log('✨ All demo data successfully wiped. System is clean and ready for real student data import.');
  await mongoose.disconnect();
}

purgeDemoData().catch((err) => {
  console.error('Error during purge:', err);
  process.exit(1);
});
