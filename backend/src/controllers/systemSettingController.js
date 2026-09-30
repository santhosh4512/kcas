const SystemSetting = require('../models/SystemSetting');
const AuditLog = require('../models/AuditLog');

// Helper to get or create settings
async function getOrCreateSettings() {
  let settings = await SystemSetting.findOne({ key: 'SYSTEM_CONFIG' });
  if (!settings) {
    settings = await SystemSetting.create({
      key: 'SYSTEM_CONFIG',
      gpsEnabled: true,
      campusLatitude: 12.1905865,
      campusLongitude: 79.0837848,
      campusRadiusMeters: 1000,
      locationAlertsEnabled: true,
      facultyNotificationEnabled: true,
      attendanceWarningThreshold: 75,
      academicWarningThreshold: 50,
      earlyWarningsEnabled: true,
      institutionName: 'KAMBAN COLLEGE OF ARTS AND SCIENCE FOR WOMEN',
      institutionTagline: 'Recognized u/s 2(f) & 12(B) of UGC Act 1956 / Accredited by NAAC / Affiliated to Thiruvalluvar University',
      institutionAddress: 'Thenmathur, Tiruvannamalai – 606 603',
      institutionPhone: '04175 – 255401',
      institutionCell: '9488029091',
      institutionEmail: 'kcastvmalai@gmail.com',
    });
  }
  return settings;
}

/**
 * @desc Get system & GPS configuration settings
 * @route GET /api/settings
 */
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update system & GPS configuration settings (Admin only)
 * @route PUT /api/settings
 */
exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();

    const {
      gpsEnabled,
      campusLatitude,
      campusLongitude,
      campusRadiusMeters,
      locationAlertsEnabled,
      facultyNotificationEnabled,
      attendanceWarningThreshold,
      academicWarningThreshold,
      earlyWarningsEnabled,
      institutionName,
      institutionTagline,
      institutionAddress,
      institutionPhone,
      institutionCell,
      institutionEmail,
    } = req.body;

    if (gpsEnabled !== undefined) settings.gpsEnabled = Boolean(gpsEnabled);
    if (campusLatitude !== undefined && !isNaN(campusLatitude)) settings.campusLatitude = Number(campusLatitude);
    if (campusLongitude !== undefined && !isNaN(campusLongitude)) settings.campusLongitude = Number(campusLongitude);
    if (campusRadiusMeters !== undefined && !isNaN(campusRadiusMeters)) settings.campusRadiusMeters = Number(campusRadiusMeters);
    if (locationAlertsEnabled !== undefined) settings.locationAlertsEnabled = Boolean(locationAlertsEnabled);
    if (facultyNotificationEnabled !== undefined) settings.facultyNotificationEnabled = Boolean(facultyNotificationEnabled);
    if (attendanceWarningThreshold !== undefined && !isNaN(attendanceWarningThreshold)) settings.attendanceWarningThreshold = Number(attendanceWarningThreshold);
    if (academicWarningThreshold !== undefined && !isNaN(academicWarningThreshold)) settings.academicWarningThreshold = Number(academicWarningThreshold);
    if (earlyWarningsEnabled !== undefined) settings.earlyWarningsEnabled = Boolean(earlyWarningsEnabled);
    if (institutionName) settings.institutionName = institutionName;
    if (institutionTagline) settings.institutionTagline = institutionTagline;
    if (institutionAddress) settings.institutionAddress = institutionAddress;
    if (institutionPhone) settings.institutionPhone = institutionPhone;
    if (institutionCell) settings.institutionCell = institutionCell;
    if (institutionEmail) settings.institutionEmail = institutionEmail;

    settings.updatedBy = req.user ? req.user._id : null;
    await settings.save();

    // Audit log
    await AuditLog.create({
      user: req.user ? req.user._id : null,
      performedBy: req.user ? req.user._id : null,
      performerName: req.user ? req.user.name : 'System Admin',
      performerRole: req.user ? req.user.role : 'admin',
      action: 'SYSTEM_SETTINGS_UPDATE',
      module: 'Settings',
      description: `Updated system configuration: GPS Geofence ${settings.campusRadiusMeters}m @ (${settings.campusLatitude}, ${settings.campusLongitude}), Attendance Threshold ${settings.attendanceWarningThreshold}%.`,
      details: req.body,
      ipAddress: req.ip || '',
    });

    res.status(200).json({
      success: true,
      message: 'System settings saved successfully.',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};
