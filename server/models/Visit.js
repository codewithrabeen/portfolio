const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      default: "/",
      trim: true,
      maxlength: 120,
    },

    type: {
      type: String,
      enum: ["portfolio_visit", "section_view"],
      default: "portfolio_visit",
    },

    userAgent: {
      type: String,
      default: "",
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Visit",
  visitSchema
);
