const express = require("express");

const {
  getSkills,
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} = require("../controllers/skillController");

const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

// Public
router.get("/", getSkills);

// Admin
router.get("/all", protect, requireAdmin, getAllSkills);

router.post(
  "/",
  protect,
  requireAdmin,
  createSkill
);

router.put(
  "/:id",
  protect,
  requireAdmin,
  updateSkill
);

router.delete(
  "/:id",
  protect,
  requireAdmin,
  deleteSkill
);

module.exports = router;
