const express = require("express");

const {
  getSkills,
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} = require("../controllers/skillController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/", getSkills);

// Admin
router.get("/all", protect, getAllSkills);

router.post(
  "/",
  protect,
  createSkill
);

router.put(
  "/:id",
  protect,
  updateSkill
);

router.delete(
  "/:id",
  protect,
  deleteSkill
);

module.exports = router;