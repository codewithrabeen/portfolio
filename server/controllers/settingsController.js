const Settings = require("../models/Settings");

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load settings",
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const allowedFields = [
      // General
      "portfolioName",
      "siteTitle",
      "email",
      "timezone",
      "language",

      // Appearance
      "theme",
      "accentColor",
      "maintenanceMode",

      // Notifications
      "emailNotifications",
      "messageNotifications",
      "projectNotifications",

      // SEO
      "seoDescription",
      "seoKeywords",
      "ogImage",
    ];

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();

    res.json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update settings",
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};