const Skill = require("../models/Skill");

// Get published skills
const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find({
      published: true,
    }).sort({
      category: 1,
      order: 1,
      createdAt: -1,
    });

    res.json({
      success: true,
      skills,
    });
  } catch (error) {
    console.error("Get skills error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch skills",
    });
  }
};

// Get all skills for admin
const getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({
      category: 1,
      order: 1,
      createdAt: -1,
    });

    res.json({
      success: true,
      skills,
    });
  } catch (error) {
    console.error("Get all skills error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch skills",
    });
  }
};

// Create skill
const createSkill = async (req, res) => {
  try {
    const skill = await Skill.create({
      category: req.body.category,
      name: req.body.name,
      level: req.body.level || 80,
      order: req.body.order || 0,
      published: req.body.published !== false,
    });

    res.status(201).json({
      success: true,
      message: "Skill created successfully",
      skill,
    });
  } catch (error) {
    console.error("Create skill error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create skill",
    });
  }
};

// Update skill
const updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    skill.category =
      req.body.category ?? skill.category;

    skill.name =
      req.body.name ?? skill.name;

    skill.level =
      req.body.level ?? skill.level;

    skill.order =
      req.body.order ?? skill.order;

    if (req.body.published !== undefined) {
      skill.published =
        req.body.published === true ||
        req.body.published === "true";
    }

    await skill.save();

    res.json({
      success: true,
      message: "Skill updated successfully",
      skill,
    });
  } catch (error) {
    console.error("Update skill error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update skill",
    });
  }
};

// Delete skill
const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(
      req.params.id
    );

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    res.json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    console.error("Delete skill error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete skill",
    });
  }
};

module.exports = {
  getSkills,
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill,
};