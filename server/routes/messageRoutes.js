const express = require("express");

const {
  createMessage,
  getMessages,
  toggleMessageRead,
  deleteMessage,
} = require("../controllers/messageController");

const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

// Public
router.post("/", createMessage);

// Admin
router.get("/", protect, requireAdmin, getMessages);
router.patch(
  "/:id/read",
  protect,
  requireAdmin,
  toggleMessageRead
);
router.delete(
  "/:id",
  protect,
  requireAdmin,
  deleteMessage
);

module.exports = router;
