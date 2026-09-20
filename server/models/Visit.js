const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      default: "/",
      trim: true,
    },

    userAgent: {
      type: String,
      default: "",
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