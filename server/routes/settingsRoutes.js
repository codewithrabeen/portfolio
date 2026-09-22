const express = require("express");

const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");

const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

// Get settings
router.get("/", getSettings);

// Update settings
router.put("/", protect, requireAdmin, updateSettings);

module.exports = router;
