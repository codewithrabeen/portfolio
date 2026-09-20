const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    // =========================
    // Identity
    // =========================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    // =========================
    // Contact
    // =========================
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // Professional
    // =========================
    availability: {
      type: String,
      default: "Available for opportunities",
      trim: true,
    },

    currentlyLearning: {
      type: String,
      default: "",
      trim: true,
    },

    yearsExperience: {
      type: Number,
      default: 0,
      min: 0,
    },

    projectsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },

    clientsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =========================
    // Links
    // =========================
    github: {
      type: String,
      default: "",
      trim: true,
    },

    linkedin: {
      type: String,
      default: "",
      trim: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    resumeUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // Visibility
    // =========================
    publicProfile: {
      type: Boolean,
      default: true,
    },

    showEmail: {
      type: Boolean,
      default: true,
    },

    showPhone: {
      type: Boolean,
      default: false,
    },

    // =========================
    // SEO
    // =========================
    seoTitle: {
      type: String,
      default: "",
      trim: true,
    },

    seoDescription: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Profile", profileSchema);