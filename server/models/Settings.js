const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    // =========================
    // GENERAL
    // =========================

    portfolioName: {
      type: String,
      default: "Rabeen Sharma",
      trim: true,
    },

    siteTitle: {
      type: String,
      default: "Rabeen Sharma — MERN & Full Stack Developer",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    timezone: {
      type: String,
      default: "Asia/Kathmandu",
      trim: true,
    },

    language: {
      type: String,
      default: "English",
      trim: true,
    },

    // =========================
    // APPEARANCE
    // =========================

    theme: {
      type: String,
      enum: ["dark", "light", "system"],
      default: "dark",
    },

    accentColor: {
      type: String,
      default: "#8b5cf6",
      trim: true,
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    // =========================
    // NOTIFICATIONS
    // =========================

    emailNotifications: {
      type: Boolean,
      default: true,
    },

    messageNotifications: {
      type: Boolean,
      default: true,
    },

    projectNotifications: {
      type: Boolean,
      default: true,
    },

    // =========================
    // SEO
    // =========================

    seoDescription: {
      type: String,
      default:
        "Rabeen Sharma — MERN and Full Stack Developer building modern, scalable and interactive web applications.",
      trim: true,
      maxlength: 300,
    },

    seoKeywords: {
      type: String,
      default:
        "Rabeen Sharma, MERN Developer, Full Stack Developer, React, Node.js, MongoDB",
      trim: true,
    },

    ogImage: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);