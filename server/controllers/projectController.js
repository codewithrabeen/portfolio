const mongoose = require("mongoose");

const Project = require("../models/Project");
const cloudinary = require("../config/cloudinary");

const uploadProjectImage = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "portfolio/projects",
        resource_type: "image",
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

const deleteProjectImage = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (error) {
    console.error(
      "Cloudinary project image cleanup failed:",
      error.message
    );
  }
};

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const parseTechnologies = (value, fallback = []) => {
  if (value === undefined) {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value.map((tech) => String(tech).trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed
        .map((tech) => String(tech).trim())
        .filter(Boolean);
    }
  } catch {
    // Fall back to comma-separated values below.
  }

  return value
    .split(",")
    .map((tech) => tech.trim())
    .filter(Boolean);
};

const parseBoolean = (value, fallback) => {
  if (value === undefined) {
    return fallback;
  }

  return value === true || value === "true";
};

const readString = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const validationErrorResponse = (res, message) => {
  return res.status(400).json({
    success: false,
    message,
  });
};

// Public - get published projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      published: true,
    }).sort({
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

// Admin - get all projects, including drafts
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Get all projects error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};

// Public - get one published project
const getProject = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return validationErrorResponse(
        res,
        "Invalid project id"
      );
    }

    const project = await Project.findOne({
      _id: req.params.id,
      published: true,
    });

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

// Admin - create project
const createProject = async (req, res) => {
  let uploadedImage = null;

  try {
    const title = readString(req.body.title);
    const description = readString(req.body.description);

    if (!title || !description) {
      return validationErrorResponse(
        res,
        "Project title and description are required"
      );
    }

    if (req.file) {
      uploadedImage = await uploadProjectImage(
        req.file.buffer
      );
    }

    const project = await Project.create({
      title,
      description,
      image: uploadedImage?.secure_url || "",
      imagePublicId: uploadedImage?.public_id || "",
      technologies: parseTechnologies(req.body.technologies),
      githubUrl: readString(req.body.githubUrl),
      liveUrl: readString(req.body.liveUrl),
      featured: parseBoolean(req.body.featured, false),
      published:
        req.body.published === undefined
          ? true
          : parseBoolean(req.body.published, true),
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    if (uploadedImage?.public_id) {
      await deleteProjectImage(uploadedImage.public_id);
    }

    console.error("Create project error:", error);

    res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message:
        error.name === "ValidationError"
          ? "Please check the project details"
          : "Failed to create project",
    });
  }
};

// Admin - update project
const updateProject = async (req, res) => {
  let uploadedImage = null;

  try {
    if (!isValidObjectId(req.params.id)) {
      return validationErrorResponse(
        res,
        "Invalid project id"
      );
    }

    const project = await Project.findById(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const oldImagePublicId = project.imagePublicId;

    if (req.file) {
      uploadedImage = await uploadProjectImage(
        req.file.buffer
      );

      project.image = uploadedImage.secure_url;
      project.imagePublicId = uploadedImage.public_id;
    }

    if (req.body.title !== undefined) {
      project.title = readString(req.body.title);
    }

    if (req.body.description !== undefined) {
      project.description = readString(req.body.description);
    }

    project.technologies = parseTechnologies(
      req.body.technologies,
      project.technologies
    );

    if (req.body.githubUrl !== undefined) {
      project.githubUrl = readString(req.body.githubUrl);
    }

    if (req.body.liveUrl !== undefined) {
      project.liveUrl = readString(req.body.liveUrl);
    }

    project.featured = parseBoolean(
      req.body.featured,
      project.featured
    );

    project.published = parseBoolean(
      req.body.published,
      project.published
    );

    await project.save();

    if (
      uploadedImage?.public_id &&
      oldImagePublicId &&
      oldImagePublicId !== uploadedImage.public_id
    ) {
      await deleteProjectImage(oldImagePublicId);
    }

    res.json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    if (uploadedImage?.public_id) {
      await deleteProjectImage(uploadedImage.public_id);
    }

    console.error("Update project error:", error);

    res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message:
        error.name === "ValidationError"
          ? "Please check the project details"
          : "Failed to update project",
    });
  }
};

// Admin - delete project
const deleteProject = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return validationErrorResponse(
        res,
        "Invalid project id"
      );
    }

    const project = await Project.findById(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const oldImagePublicId = project.imagePublicId;

    await project.deleteOne();

    if (oldImagePublicId) {
      await deleteProjectImage(oldImagePublicId);
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
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
