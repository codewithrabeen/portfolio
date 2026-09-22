const { z } = require("zod");
const mongoose = require("mongoose");

const Message = require("../models/Message");

const htmlLikePattern = /<\/?[a-z][\s\S]*>/i;
const controlCharacterPattern = /[\u0000-\u001F\u007F]/u;
const urlPattern = /(https?:\/\/|www\.)/i;

const cleanText = (value) =>
  typeof value === "string" ? value.trim() : value;

const messageSchema = z.object({
  name: z
    .preprocess(
      cleanText,
      z
        .string()
        .min(2, "Name must be at least 2 characters.")
        .max(80, "Name must be 80 characters or fewer.")
        .refine(
          (value) =>
            !controlCharacterPattern.test(value) &&
            !urlPattern.test(value),
          "Name contains unsupported content."
        )
    ),
  email: z
    .preprocess(
      cleanText,
      z
        .string()
        .email("Enter a valid email address.")
        .max(120, "Email must be 120 characters or fewer.")
        .transform((value) => value.toLowerCase())
    ),
  subject: z
    .preprocess(
      (value) =>
        value === undefined || value === null
          ? ""
          : cleanText(value),
      z
        .string()
        .max(120, "Subject must be 120 characters or fewer.")
        .refine(
          (value) =>
            !controlCharacterPattern.test(value) &&
            !htmlLikePattern.test(value),
          "Subject contains unsupported content."
        )
    ),
  message: z
    .preprocess(
      cleanText,
      z
        .string()
        .min(10, "Message must be at least 10 characters.")
        .max(2000, "Message must be 2000 characters or fewer.")
        .refine(
          (value) =>
            !controlCharacterPattern.test(value) &&
            !htmlLikePattern.test(value),
          "Message contains unsupported content."
        )
    ),
});

const validationErrorResponse = (res, error) => {
  return res.status(400).json({
    success: false,
    message: "Please check your message details.",
    errors: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  });
};

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const invalidIdResponse = (res) => {
  return res.status(400).json({
    success: false,
    message: "Invalid message id.",
  });
};

// Public - create message
const createMessage = async (req, res) => {
  try {
    const parsed = messageSchema.safeParse(req.body);

    if (!parsed.success) {
      return validationErrorResponse(res, parsed.error);
    }

    const newMessage = await Message.create(parsed.data);

    res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: newMessage,
    });
  } catch (error) {
    console.error("Create message error:", error);

    res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message:
        error.name === "ValidationError"
          ? "Please check your message details."
          : "Failed to send message.",
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
    if (!isValidObjectId(req.params.id)) {
      return invalidIdResponse(res);
    }

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
    if (!isValidObjectId(req.params.id)) {
      return invalidIdResponse(res);
    }

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
