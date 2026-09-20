const express = require("express");

const {
  login,
  logout,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const User = require("../models/User");

const router = express.Router();

// Login
router.post("/login", login);

// Logout
router.post("/logout", logout);

// Current authenticated user
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
