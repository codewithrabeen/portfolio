const express = require("express");

const {
  createVisit,
  getVisitStats,
} = require("../controllers/visitController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.post("/", createVisit);

// Admin
router.get("/stats", protect, getVisitStats);

module.exports = router;