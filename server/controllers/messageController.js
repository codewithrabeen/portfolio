const Message = require("../models/Message");

// Public - create message
const createMessage = async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message,
    } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required.",
      });
    }

    const newMessage = await Message.create({
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || "",
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: newMessage,
    });
  } catch (error) {
    console.error("Create message error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send message.",
    });
  }
};


// Admin - get all messages
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch messages.",
    });
  }
};


// Admin - mark message as read/unread
const toggleMessageRead = async (req, res) => {
  try {
    const message = await Message.findById(
      req.params.id
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    message.read = !message.read;

    await message.save();

    res.json({
      success: true,
      message: "Message status updated.",
      data: message,
    });
  } catch (error) {
    console.error(
      "Toggle message read error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update message.",
    });
  }
};


// Admin - delete message
const deleteMessage = async (req, res) => {
  try {
    const message =
      await Message.findByIdAndDelete(
        req.params.id
      );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    res.json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete message error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete message.",
    });
  }
};


module.exports = {
  createMessage,
  getMessages,
  toggleMessageRead,
  deleteMessage,
};