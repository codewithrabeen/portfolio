const express = require("express");

const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Public
router.get("/", getProfile);

// Admin
router.put(
  "/",
  protect,
  requireAdmin,
  upload.fields([
    {
      name: "profileImage",
      maxCount: 1,
    },
    {
      name: "resume",
      maxCount: 1,
    },
  ]),
  updateProfile
);

module.exports = router;
