const Project = require("../models/Project");
const cloudinary = require("../config/cloudinary");


const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "portfolio/projects",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};


// Get all projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};

// Get single project
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get project error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch project",
    });
  }
};

// Create project
const createProject = async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer
      );

      imageUrl = result.secure_url;
    }

    let technologies = req.body.technologies || [];

    if (typeof technologies === "string") {
      try {
        technologies = JSON.parse(technologies);
      } catch {
        technologies = technologies
          .split(",")
          .map((tech) => tech.trim())
          .filter(Boolean);
      }
    }

    const project = await Project.create({
      title: req.body.title,
      description: req.body.description,
      image: imageUrl,
      technologies,
      githubUrl: req.body.githubUrl || "",
      liveUrl: req.body.liveUrl || "",
      featured: req.body.featured === "true",
      published: req.body.published !== "false",
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    let imageUrl = project.image;

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer
      );

      imageUrl = result.secure_url;
    }

    let technologies =
      req.body.technologies ?? project.technologies;

    if (typeof technologies === "string") {
      try {
        technologies = JSON.parse(technologies);
      } catch {
        technologies = technologies
          .split(",")
          .map((tech) => tech.trim())
          .filter(Boolean);
      }
    }

    project.title =
      req.body.title ?? project.title;

    project.description =
      req.body.description ?? project.description;

    project.image = imageUrl;

    project.technologies = technologies;

    project.githubUrl =
      req.body.githubUrl ?? project.githubUrl;

    project.liveUrl =
      req.body.liveUrl ?? project.liveUrl;

    if (req.body.featured !== undefined) {
      project.featured =
        req.body.featured === "true";
    }

    if (req.body.published !== undefined) {
      project.published =
        req.body.published !== "false";
    }

    await project.save();

    res.json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Update project error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};