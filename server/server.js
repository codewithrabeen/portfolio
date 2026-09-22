require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const profileRoutes = require("./routes/profileRoutes");
const skillRoutes = require("./routes/skillRoutes");
const experienceRoutes = require("./routes/experienceRoutes");
const educationRoutes = require("./routes/educationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const visitRoutes = require("./routes/visitRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

// ======================================================
// ENVIRONMENT
// ======================================================

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

// ======================================================
// CLOUDINARY CONFIG CHECK
// ======================================================

if (!isProduction) {
  console.log("Cloudinary config check:", {
    cloudName: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    apiKey: Boolean(process.env.CLOUDINARY_API_KEY),
    apiSecret: Boolean(process.env.CLOUDINARY_API_SECRET),
  });
}

// ======================================================
// DATABASE
// ======================================================

connectDB();

// ======================================================
// CORS
// ======================================================

const parseOrigins = (...values) => {
  return values
    .flatMap((value) =>
      String(value || "")
        .split(",")
        .map((origin) => origin.trim())
    )
    .filter(Boolean)
    .map((origin) => {
      try {
        return new URL(origin).origin;
      } catch {
        return origin.replace(/\/$/, "");
      }
    });
};

const allowedOrigins = [
  ...parseOrigins(
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
    process.env.CORS_ORIGINS
  ),

  // Local development
  "http://localhost:5173",
  "http://localhost:5174",
];

const uniqueAllowedOrigins = [
  ...new Set(allowedOrigins),
];

if (!isProduction) {
  console.log(
    "Allowed CORS origins:",
    uniqueAllowedOrigins
  );
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      // such as Postman/server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (uniqueAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (!isProduction) {
        console.warn("Blocked CORS origin:", origin);
      }

      return callback(
        new Error(
          isProduction
            ? "CORS origin not allowed"
            : `CORS blocked for origin: ${origin}`
        )
      );
    },
    credentials: true,
  })
);

// ======================================================
// BODY PARSING
// ======================================================

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Portfolio API is running",
    environment: NODE_ENV,
  });
});

// ======================================================
// ROUTES
// ======================================================

app.use("/api/auth", authRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/skills", skillRoutes);

app.use("/api/experiences", experienceRoutes);

app.use("/api/education", educationRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/visits", visitRoutes);

app.use("/api/settings", settingsRoutes);

// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ======================================================
// ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(err.status || 500).json({
    success: false,
    message:
      NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} (${NODE_ENV})`
  );
});
