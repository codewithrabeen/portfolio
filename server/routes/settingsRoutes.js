const express = require("express");

const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");

const router = express.Router();

// Get settings
router.get("/", getSettings);

// Update settings
router.put("/", updateSettings);

module.exports = router;