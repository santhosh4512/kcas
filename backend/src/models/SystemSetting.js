const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'SYSTEM_CONFIG',
      unique: true,
    },
    // GPS & Geofencing Settings
    gpsEnabled: {
      type: Boolean,
      default: true,
    },
    campusLatitude: {
      type: Number,
      default: 12.1905865,
    },
    campusLongitude: {
      type: Number,
      default: 79.0837848,
    },
    campusRadiusMeters: {
      type: Number,
      default: 1000,
    },
    locationAlertsEnabled: {
      type: Boolean,
      default: true,
    },
    facultyNotificationEnabled: {
      type: Boolean,
      default: true,
    },
    // Academic & Attendance Warning Thresholds
    attendanceWarningThreshold: {
      type: Number,
      default: 75,
    },
    academicWarningThreshold: {
      type: Number,
      default: 50,
    },
    earlyWarningsEnabled: {
      type: Boolean,
      default: true,
    },
    // College Institutional Details
    institutionName: {
      type: String,
      default: 'KAMBAN COLLEGE OF ARTS AND SCIENCE FOR WOMEN',
    },
    institutionTagline: {
      type: String,
      default: 'Recognized u/s 2(f) & 12(B) of UGC Act 1956 / Accredited by NAAC / Affiliated to Thiruvalluvar University',
    },
    institutionAddress: {
      type: String,
      default: 'Thenmathur, Tiruvannamalai – 606 603',
    },
    institutionPhone: {
      type: String,
      default: '04175 – 255401',
    },
    institutionCell: {
      type: String,
      default: '9488029091',
    },
    institutionEmail: {
      type: String,
      default: 'kcastvmalai@gmail.com',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
