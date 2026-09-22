const express = require("express");

const {
  getExperiences,
  getAllExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
} = require("../controllers/experienceController");

const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

// Public
router.get("/", getExperiences);

// Admin
router.get(
  "/all",
  protect,
  requireAdmin,
  getAllExperiences
);

router.post("/", protect, requireAdmin, createExperience);

router.put("/:id", protect, requireAdmin, updateExperience);

router.delete("/:id", protect, requireAdmin, deleteExperience);

module.exports = router;
