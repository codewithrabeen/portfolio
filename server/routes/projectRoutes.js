const express = require("express");

const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getAllProjects,
} = require("../controllers/projectController");

const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Public
router.get("/", getProjects);

// Admin
router.get(
  "/all",
  protect,
  requireAdmin,
  getAllProjects
);

// Public
router.get("/:id", getProject);

// Admin
router.post(
  "/",
  protect,
  requireAdmin,
  upload.single("image"),
  createProject
);

router.put(
  "/:id",
  protect,
  requireAdmin,
  upload.single("image"),
  updateProject
);

router.delete(
  "/:id",
  protect,
  requireAdmin,
  deleteProject
);

module.exports = router;
