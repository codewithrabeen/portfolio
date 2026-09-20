const express = require("express");

const {
  getEducations,
  getAllEducations,
  createEducation,
  updateEducation,
  deleteEducation,
} = require("../controllers/educationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/", getEducations);

// Admin
router.get("/all", protect, getAllEducations);

router.post("/", protect, createEducation);

router.put("/:id", protect, updateEducation);

router.delete("/:id", protect, deleteEducation);

module.exports = router;