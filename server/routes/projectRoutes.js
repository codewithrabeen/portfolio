const express = require("express");

const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Public
router.get("/", getProjects);
router.get("/:id", getProject);

// Admin
router.post(
  "/",
  protect,
  upload.single("image"),
  createProject
);

router.put(
  "/:id",
  protect,
  upload.single("image"),
  updateProject
);

router.delete(
  "/:id",
  protect,
  deleteProject
);

module.exports = router;  