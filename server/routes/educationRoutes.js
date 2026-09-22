const express = require("express");

const {
  getEducations,
  getAllEducations,
  createEducation,
  updateEducation,
  deleteEducation,
} = require("../controllers/educationController");

const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

// Public
router.get("/", getEducations);

// Admin
router.get(
  "/all",
  protect,
  requireAdmin,
  getAllEducations
);

router.post("/", protect, requireAdmin, createEducation);

router.put("/:id", protect, requireAdmin, updateEducation);

router.delete("/:id", protect, requireAdmin, deleteEducation);

module.exports = router;
