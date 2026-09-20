const Experience = require("../models/Experience");

// Get published experiences
const getExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find({
      published: true,
    }).sort({
      order: 1,
      startDate: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      experiences,
    });
  } catch (error) {
    console.error("Get experiences error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch experiences",
    });
  }
};

// Get all experiences for admin
const getAllExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find().sort({
      order: 1,
      startDate: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      experiences,
    });
  } catch (error) {
    console.error("Get all experiences error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch experiences",
    });
  }
};

// Create experience
const createExperience = async (req, res) => {
  try {
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

    const experience = await Experience.create({
      title: req.body.title,
      company: req.body.company,
      startDate: req.body.startDate,
      endDate: req.body.endDate || "",
      current:
        req.body.current === true ||
        req.body.current === "true",
      description: req.body.description,
      technologies,
      order: Number(req.body.order) || 0,
      published:
        req.body.published !== false &&
        req.body.published !== "false",
    });

    res.status(201).json({
      success: true,
      message: "Experience created successfully",
      experience,
    });
  } catch (error) {
    console.error("Create experience error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create experience",
    });
  }
};

// Update experience
const updateExperience = async (req, res) => {
  try {
    const experience = await Experience.findById(
      req.params.id
    );

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    let technologies =
      req.body.technologies ??
      experience.technologies;

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

    experience.title =
      req.body.title ?? experience.title;

    experience.company =
      req.body.company ?? experience.company;

    experience.startDate =
      req.body.startDate ?? experience.startDate;

    experience.endDate =
      req.body.endDate ?? experience.endDate;

    experience.description =
      req.body.description ??
      experience.description;

    experience.technologies = technologies;

    if (req.body.current !== undefined) {
      experience.current =
        req.body.current === true ||
        req.body.current === "true";
    }

    if (req.body.order !== undefined) {
      experience.order = Number(req.body.order);
    }

    if (req.body.published !== undefined) {
      experience.published =
        req.body.published === true ||
        req.body.published === "true";
    }

    await experience.save();

    res.json({
      success: true,
      message: "Experience updated successfully",
      experience,
    });
  } catch (error) {
    console.error("Update experience error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update experience",
    });
  }
};

// Delete experience
const deleteExperience = async (req, res) => {
  try {
    const experience =
      await Experience.findByIdAndDelete(
        req.params.id
      );

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    res.json({
      success: true,
      message: "Experience deleted successfully",
    });
  } catch (error) {
    console.error("Delete experience error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete experience",
    });
  }
};

module.exports = {
  getExperiences,
  getAllExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
};