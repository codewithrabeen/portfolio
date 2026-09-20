const express = require("express");

const {
  createMessage,
  getMessages,
  toggleMessageRead,
  deleteMessage,
} = require("../controllers/messageController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.post("/", createMessage);

// Admin
router.get("/", protect, getMessages);
router.patch("/:id/read", protect, toggleMessageRead);
router.delete("/:id", protect, deleteMessage);

module.exports = router;