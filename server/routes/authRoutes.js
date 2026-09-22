const express = require("express");

const {
  login,
  logout,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Login
router.post("/login", login);

// Logout
router.post("/logout", logout);

// Current authenticated user
router.get("/me", protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
