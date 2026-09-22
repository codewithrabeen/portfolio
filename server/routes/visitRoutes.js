const express = require("express");

const {
  createVisit,
  getVisitStats,
} = require("../controllers/visitController");

const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

// Public
router.post("/", createVisit);

// Admin
router.get(
  "/stats",
  protect,
  requireAdmin,
  getVisitStats
);

module.exports = router;
