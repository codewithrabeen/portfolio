const Profile = require("../models/Profile");
const cloudinary = require("../config/cloudinary");

/**
 * Upload a buffer directly to Cloudinary.
 */
const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
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

// ============================================================
// GET PROFILE
// Public
// ============================================================
const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

// ============================================================
// CREATE / UPDATE PROFILE
// Admin protected route
// ============================================================
const updateProfile = async (req, res) => {
  try {
    // --------------------------------------------------------
    // Find existing profile
    // --------------------------------------------------------
    let profile = await Profile.findOne();

    // --------------------------------------------------------
    // Preserve existing uploaded files
    // --------------------------------------------------------
    let profileImage = profile?.profileImage || "";
    let resumeUrl = profile?.resumeUrl || "";

    // ========================================================
    // PROFILE IMAGE UPLOAD
    // ========================================================
    const imageFile = req.files?.profileImage?.[0];

    if (imageFile) {
      console.log("Uploading profile image to Cloudinary...");

      const imageResult = await uploadToCloudinary(
        imageFile.buffer,
        {
          folder: "portfolio/profile",
          resource_type: "image",
        }
      );

      profileImage = imageResult.secure_url;

      console.log(
        "Profile image uploaded:",
        profileImage
      );
    }

    // ========================================================
    // RESUME PDF UPLOAD
    // ========================================================
    const resumeFile = req.files?.resume?.[0];

    if (resumeFile) {
      console.log("Uploading resume PDF to Cloudinary...");

 const resumeResult = await uploadToCloudinary(
  resumeFile.buffer,
  {
    folder: "portfolio/resumes",
    resource_type: "raw",
    public_id: `resume-${Date.now()}`,
    format: "pdf",
    overwrite: true,
  }
);

      resumeUrl = resumeResult.secure_url;

      console.log(
        "Resume uploaded:",
        resumeUrl
      );
    }

    // ========================================================
    // REMOVE EXISTING RESUME
    // ========================================================
    if (
      req.body.removeResume === "true" &&
      !resumeFile
    ) {
      resumeUrl = "";

      console.log("Resume removed from profile.");
    }

    // ========================================================
    // VISIBILITY SETTINGS
    //
    // IMPORTANT:
    // Only change these values when they are actually
    // included in the request.
    //
    // This prevents a resume/profile update from
    // accidentally setting publicProfile to false.
    // ========================================================

    const publicProfile =
      req.body.publicProfile !== undefined
        ? req.body.publicProfile === "true"
        : profile?.publicProfile ?? true;

    const showEmail =
      req.body.showEmail !== undefined
        ? req.body.showEmail === "true"
        : profile?.showEmail ?? true;

    const showPhone =
      req.body.showPhone !== undefined
        ? req.body.showPhone === "true"
        : profile?.showPhone ?? false;

    // ========================================================
    // PROFILE DATA
    // ========================================================
    const profileData = {
      // ------------------------------------------------------
      // Identity
      // ------------------------------------------------------
      name:
        req.body.name?.trim() || "",

      title:
        req.body.title?.trim() || "",

      bio:
        req.body.bio?.trim() || "",

      profileImage,

      // ------------------------------------------------------
      // Contact
      // ------------------------------------------------------
      email:
        req.body.email?.trim().toLowerCase() || "",

      phone:
        req.body.phone?.trim() || "",

      location:
        req.body.location?.trim() || "",

      // ------------------------------------------------------
      // Professional
      // ------------------------------------------------------
      availability:
        req.body.availability?.trim() ||
        profile?.availability ||
        "Available for opportunities",

      currentlyLearning:
        req.body.currentlyLearning?.trim() ||
        profile?.currentlyLearning ||
        "",

      yearsExperience:
        req.body.yearsExperience !== undefined &&
        req.body.yearsExperience !== ""
          ? Number(req.body.yearsExperience) >= 0
            ? Number(req.body.yearsExperience)
            : 0
          : profile?.yearsExperience ?? 0,

      projectsCompleted:
        req.body.projectsCompleted !== undefined &&
        req.body.projectsCompleted !== ""
          ? Number(req.body.projectsCompleted) >= 0
            ? Number(req.body.projectsCompleted)
            : 0
          : profile?.projectsCompleted ?? 0,

      clientsCount:
        req.body.clientsCount !== undefined &&
        req.body.clientsCount !== ""
          ? Number(req.body.clientsCount) >= 0
            ? Number(req.body.clientsCount)
            : 0
          : profile?.clientsCount ?? 0,

      // ------------------------------------------------------
      // Links
      // ------------------------------------------------------
      github:
        req.body.github?.trim() ||
        profile?.github ||
        "",

      linkedin:
        req.body.linkedin?.trim() ||
        profile?.linkedin ||
        "",

      website:
        req.body.website?.trim() ||
        profile?.website ||
        "",

      // ------------------------------------------------------
      // Resume
      // ------------------------------------------------------
      resumeUrl,

      // ------------------------------------------------------
      // Visibility
      // ------------------------------------------------------
      publicProfile,
      showEmail,
      showPhone,

      // ------------------------------------------------------
      // SEO
      // ------------------------------------------------------
      seoTitle:
        req.body.seoTitle?.trim() ||
        profile?.seoTitle ||
        "",

      seoDescription:
        req.body.seoDescription?.trim() ||
        profile?.seoDescription ||
        "",
    };

    // ========================================================
    // SAVE PROFILE
    // ========================================================
    if (profile) {
      Object.assign(profile, profileData);

      await profile.save();
    } else {
      profile = await Profile.create(profileData);
    }

    // ========================================================
    // RESPONSE
    // ========================================================
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update profile",
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  getProfile,
  updateProfile,
};