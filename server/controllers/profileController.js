const Profile = require("../models/Profile");
const cloudinary = require("../config/cloudinary");

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

const deleteCloudinaryAsset = async (
  publicId,
  resourceType = "image"
) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error(
      "Cloudinary profile asset cleanup failed:",
      error.message
    );
  }
};

const readString = (body, field, fallback = "") => {
  if (body[field] === undefined) {
    return fallback;
  }

  return String(body[field]).trim();
};

const readLowerString = (body, field, fallback = "") => {
  return readString(body, field, fallback).toLowerCase();
};

const readBoolean = (body, field, fallback) => {
  if (body[field] === undefined) {
    return fallback;
  }

  return body[field] === true || body[field] === "true";
};

const readNonNegativeNumber = (body, field, fallback = 0) => {
  if (body[field] === undefined || body[field] === "") {
    return fallback;
  }

  const parsed = Number(body[field]);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
};

// Public
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

// Admin
const updateProfile = async (req, res) => {
  let uploadedProfileImage = null;
  let uploadedResume = null;

  try {
    let profile = await Profile.findOne();

    let profileImage = profile?.profileImage || "";
    let profileImagePublicId =
      profile?.profileImagePublicId || "";
    let resumeUrl = profile?.resumeUrl || "";
    let resumePublicId = profile?.resumePublicId || "";

    const oldProfileImagePublicId =
      profile?.profileImagePublicId || "";
    const oldResumePublicId =
      profile?.resumePublicId || "";

    const imageFile = req.files?.profileImage?.[0];

    if (imageFile) {
      uploadedProfileImage = await uploadToCloudinary(
        imageFile.buffer,
        {
          folder: "portfolio/profile",
          resource_type: "image",
        }
      );

      profileImage = uploadedProfileImage.secure_url;
      profileImagePublicId = uploadedProfileImage.public_id;
    }

    const resumeFile = req.files?.resume?.[0];

    if (resumeFile) {
      uploadedResume = await uploadToCloudinary(
        resumeFile.buffer,
        {
          folder: "portfolio/resumes",
          resource_type: "raw",
          public_id: `resume-${Date.now()}`,
          format: "pdf",
          overwrite: true,
        }
      );

      resumeUrl = uploadedResume.secure_url;
      resumePublicId = uploadedResume.public_id;
    } else if (req.body.removeResume === "true") {
      resumeUrl = "";
      resumePublicId = "";
    }

    const profileData = {
      name: readString(
        req.body,
        "name",
        profile?.name || ""
      ),
      title: readString(
        req.body,
        "title",
        profile?.title || ""
      ),
      bio: readString(req.body, "bio", profile?.bio || ""),
      profileImage,
      profileImagePublicId,
      email: readLowerString(
        req.body,
        "email",
        profile?.email || ""
      ),
      phone: readString(
        req.body,
        "phone",
        profile?.phone || ""
      ),
      location: readString(
        req.body,
        "location",
        profile?.location || ""
      ),
      availability: readString(
        req.body,
        "availability",
        profile?.availability ||
          "Available for opportunities"
      ),
      currentlyLearning: readString(
        req.body,
        "currentlyLearning",
        profile?.currentlyLearning || ""
      ),
      yearsExperience: readNonNegativeNumber(
        req.body,
        "yearsExperience",
        profile?.yearsExperience ?? 0
      ),
      projectsCompleted: readNonNegativeNumber(
        req.body,
        "projectsCompleted",
        profile?.projectsCompleted ?? 0
      ),
      clientsCount: readNonNegativeNumber(
        req.body,
        "clientsCount",
        profile?.clientsCount ?? 0
      ),
      github: readString(
        req.body,
        "github",
        profile?.github || ""
      ),
      linkedin: readString(
        req.body,
        "linkedin",
        profile?.linkedin || ""
      ),
      website: readString(
        req.body,
        "website",
        profile?.website || ""
      ),
      resumeUrl,
      resumePublicId,
      publicProfile: readBoolean(
        req.body,
        "publicProfile",
        profile?.publicProfile ?? true
      ),
      showEmail: readBoolean(
        req.body,
        "showEmail",
        profile?.showEmail ?? true
      ),
      showPhone: readBoolean(
        req.body,
        "showPhone",
        profile?.showPhone ?? false
      ),
      seoTitle: readString(
        req.body,
        "seoTitle",
        profile?.seoTitle || ""
      ),
      seoDescription: readString(
        req.body,
        "seoDescription",
        profile?.seoDescription || ""
      ),
    };

    if (!profileData.name || !profileData.title) {
      if (uploadedProfileImage?.public_id) {
        await deleteCloudinaryAsset(
          uploadedProfileImage.public_id,
          "image"
        );
      }

      if (uploadedResume?.public_id) {
        await deleteCloudinaryAsset(
          uploadedResume.public_id,
          "raw"
        );
      }

      return res.status(400).json({
        success: false,
        message: "Name and title are required",
      });
    }

    if (profile) {
      Object.assign(profile, profileData);
      await profile.save();
    } else {
      profile = await Profile.create(profileData);
    }

    if (
      uploadedProfileImage?.public_id &&
      oldProfileImagePublicId &&
      oldProfileImagePublicId !==
        uploadedProfileImage.public_id
    ) {
      await deleteCloudinaryAsset(
        oldProfileImagePublicId,
        "image"
      );
    }

    if (
      oldResumePublicId &&
      (uploadedResume?.public_id ||
        req.body.removeResume === "true") &&
      oldResumePublicId !== uploadedResume?.public_id
    ) {
      await deleteCloudinaryAsset(
        oldResumePublicId,
        "raw"
      );
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    if (uploadedProfileImage?.public_id) {
      await deleteCloudinaryAsset(
        uploadedProfileImage.public_id,
        "image"
      );
    }

    if (uploadedResume?.public_id) {
      await deleteCloudinaryAsset(
        uploadedResume.public_id,
        "raw"
      );
    }

    console.error("Update profile error:", error);

    return res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message:
        error.name === "ValidationError"
          ? "Please check the profile details"
          : "Failed to update profile",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
