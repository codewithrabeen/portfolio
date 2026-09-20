const Education = require("../models/Education");

// Get published education
const getEducations = async (req, res) => {
  try {
    const educations = await Education.find({
      published: true,
    }).sort({
      order: 1,
      startDate: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      educations,
    });
  } catch (error) {
    console.error("Get educations error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch education",
    });
  }
};

// Get all education for admin
const getAllEducations = async (req, res) => {
  try {
    const educations = await Education.find().sort({
      order: 1,
      startDate: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      educations,
    });
  } catch (error) {
    console.error("Get all educations error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch education",
    });
  }
};

// Create education
const createEducation = async (req, res) => {
  try {
    let subjects = req.body.subjects || [];

    if (typeof subjects === "string") {
      try {
        subjects = JSON.parse(subjects);
      } catch {
        subjects = subjects
          .split(",")
          .map((subject) => subject.trim())
          .filter(Boolean);
      }
    }

    const education = await Education.create({
      degree: req.body.degree,
      institution: req.body.institution,
      startDate: req.body.startDate,
      endDate: req.body.endDate || "",
      current:
        req.body.current === true ||
        req.body.current === "true",
      description: req.body.description,
      subjects,
      order: Number(req.body.order) || 0,
      published:
        req.body.published !== false &&
        req.body.published !== "false",
    });

    res.status(201).json({
      success: true,
      message: "Education created successfully",
      education,
    });
  } catch (error) {
    console.error("Create education error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create education",
    });
  }
};

// Update education
const updateEducation = async (req, res) => {
  try {
    const education = await Education.findById(
      req.params.id
    );

    if (!education) {
      return res.status(404).json({
        success: false,
        message: "Education not found",
      });
    }

    let subjects =
      req.body.subjects ?? education.subjects;

    if (typeof subjects === "string") {
      try {
        subjects = JSON.parse(subjects);
      } catch {
        subjects = subjects
          .split(",")
          .map((subject) => subject.trim())
          .filter(Boolean);
      }
    }

    education.degree =
      req.body.degree ?? education.degree;

    education.institution =
      req.body.institution ??
      education.institution;

    education.startDate =
      req.body.startDate ??
      education.startDate;

    education.endDate =
      req.body.endDate ??
      education.endDate;

    education.description =
      req.body.description ??
      education.description;

    education.subjects = subjects;

    if (req.body.current !== undefined) {
      education.current =
        req.body.current === true ||
        req.body.current === "true";
    }

    if (req.body.order !== undefined) {
      education.order = Number(req.body.order);
    }

    if (req.body.published !== undefined) {
      education.published =
        req.body.published === true ||
        req.body.published === "true";
    }

    await education.save();

    res.json({
      success: true,
      message: "Education updated successfully",
      education,
    });
  } catch (error) {
    console.error("Update education error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update education",
    });
  }
};

// Delete education
const deleteEducation = async (req, res) => {
  try {
    const education =
      await Education.findByIdAndDelete(
        req.params.id
      );

    if (!education) {
      return res.status(404).json({
        success: false,
        message: "Education not found",
      });
    }

    res.json({
      success: true,
      message: "Education deleted successfully",
    });
  } catch (error) {
    console.error("Delete education error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete education",
    });
  }
};

module.exports = {
  getEducations,
  getAllEducations,
  createEducation,
  updateEducation,
  deleteEducation,
};