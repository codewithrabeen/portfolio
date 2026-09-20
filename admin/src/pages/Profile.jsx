import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import "./Profile.css";

function Profile() {
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    email: "",
    location: "",
    github: "",
    linkedin: "",
    resumeUrl: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [removeResume, setRemoveResume] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/profile");

      if (response.data.success) {
        const profile = response.data.profile;

        setFormData({
          name: profile.name || "",
          title: profile.title || "",
          bio: profile.bio || "",
          email: profile.email || "",
          location: profile.location || "",
          github: profile.github || "",
          linkedin: profile.linkedin || "",
          resumeUrl: profile.resumeUrl || "",
        });

        setCurrentImage(profile.profileImage || "");
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        setMessage({
          type: "error",
          text:
            error.response?.data?.message ||
            "Failed to load profile.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage({
      type: "",
      text: "",
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: "Please select a valid image file.",
      });

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Image must be smaller than 5MB.",
      });

      e.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setProfileImage(file);
    setImagePreview(previewUrl);

    setMessage({
      type: "",
      text: "",
    });
  };

  const removeSelectedImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setProfileImage(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setMessage({
        type: "error",
        text: "Resume must be a PDF file.",
      });
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Resume must be smaller than 10MB.",
      });
      e.target.value = "";
      return;
    }

    setResumeFile(file);
    setResumeName(file.name);
    setRemoveResume(false);

    setMessage({
      type: "",
      text: "",
    });
  };

  const cancelSelectedResume = () => {
    setResumeFile(null);
    setResumeName("");
    setRemoveResume(false);

    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
  };

  const markResumeForRemoval = () => {
    setResumeFile(null);
    setResumeName("");
    setRemoveResume(true);

    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
  };

  const undoResumeRemoval = () => {
    setRemoveResume(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    setMessage({
      type: "",
      text: "",
    });

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("title", formData.title);
      data.append("bio", formData.bio);
      data.append("email", formData.email);
      data.append("location", formData.location);
      data.append("github", formData.github);
      data.append("linkedin", formData.linkedin);
      data.append("resumeUrl", formData.resumeUrl);

      if (resumeFile instanceof File) {
        data.append("resume", resumeFile);
      }

      data.append("removeResume", String(removeResume));

      if (profileImage instanceof File) {
        data.append("profileImage", profileImage);
      }

      const response = await api.put("/profile", data);

      if (response.data.success) {
        const profile = response.data.profile;

        setCurrentImage(profile.profileImage || "");
        setProfileImage(null);

        setFormData((prev) => ({
          ...prev,
          resumeUrl: profile.resumeUrl || "",
        }));

        setResumeFile(null);
        setResumeName("");
        setRemoveResume(false);

        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }

        setImagePreview("");

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        if (resumeInputRef.current) {
          resumeInputRef.current.value = "";
        }

        setMessage({
          type: "success",
          text: "Profile updated successfully.",
        });
      }
    } catch (error) {
      console.error("Save profile error:", error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to save profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const displayedImage = imagePreview || currentImage;

  const initials = formData.name
    ? formData.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "R";

  return (
    <div className="profile-page">
      {/* Page Header */}
      <div className="profile-page-header">
        <div>
          <div className="profile-breadcrumb">
            Portfolio Management
            <span>/</span>
            Profile
          </div>

          <h1>Profile</h1>

          <p>
            Manage the information displayed across your portfolio.
          </p>
        </div>

        <div className="profile-header-badge">
          <span className="profile-status-dot" />
          Profile settings
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`profile-alert ${
            message.type === "success"
              ? "profile-alert-success"
              : "profile-alert-error"
          }`}
        >
          <span className="profile-alert-icon">
            {message.type === "success" ? "✓" : "!"}
          </span>

          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Top Section */}
        <div className="profile-grid">
          {/* Identity Card */}
          <section className="profile-card profile-identity-card">
            <div className="profile-card-header">
              <div>
                <h2>Profile Identity</h2>
                <p>Your public profile image and identity.</p>
              </div>
            </div>

            <div className="profile-avatar-section">
              <div className="profile-avatar-wrapper">
                {displayedImage ? (
                  <img
                    src={displayedImage}
                    alt="Profile"
                    className="profile-avatar"
                  />
                ) : (
                  <div className="profile-avatar profile-avatar-placeholder">
                    {initials}
                  </div>
                )}

                <button
                  type="button"
                  className="profile-camera-button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Change profile image"
                >
                  +
                </button>
              </div>

              <div className="profile-image-info">
                <h3>{formData.name || "Your Name"}</h3>

                <p>
                  {formData.title || "Professional Title"}
                </p>

                <div className="profile-image-actions">
                  <button
                    type="button"
                    className="profile-secondary-button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    Change photo
                  </button>

                  {profileImage && (
                    <button
                      type="button"
                      className="profile-remove-button"
                      onClick={removeSelectedImage}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-upload-note">
              <span>ⓘ</span>
              <p>
                JPG, PNG or WEBP. Maximum file size is 5MB.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className="profile-hidden-input"
            />
          </section>

          {/* Basic Information */}
          <section className="profile-card">
            <div className="profile-card-header">
              <div>
                <h2>Basic Information</h2>
                <p>Introduce yourself to portfolio visitors.</p>
              </div>
            </div>

            <div className="profile-form-grid">
              <div className="profile-field">
                <label htmlFor="name">
                  Full Name
                  <span>*</span>
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Rabeen Sharma"
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="title">
                  Professional Title
                  <span>*</span>
                </label>

                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Full Stack Developer"
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="location">
                  Location
                </label>

                <input
                  id="location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Kathmandu, Nepal"
                />
              </div>

              <div className="profile-field profile-field-full">
                <label htmlFor="bio">
                  About / Bio
                </label>

                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Write a short introduction about yourself..."
                />

                <div className="profile-character-count">
                  {formData.bio.length} characters
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Social Links */}
        <section className="profile-card profile-links-card">
          <div className="profile-card-header">
            <div>
              <h2>Social & Professional Links</h2>
              <p>
                Connect visitors with your professional profiles.
              </p>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="profile-field">
              <label htmlFor="github">GitHub</label>

              <div className="profile-input-with-icon">
                <span className="profile-input-icon">GH</span>

                <input
                  id="github"
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="linkedin">LinkedIn</label>

              <div className="profile-input-with-icon">
                <span className="profile-input-icon">in</span>

                <input
                  id="linkedin"
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="profile-field profile-field-full profile-resume-field">
              <label>
                Resume
              </label>

              <div className="profile-resume-uploader">
                <div className="profile-resume-icon">
                  PDF
                </div>

                <div className="profile-resume-content">
                  {resumeFile ? (
                    <>
                      <strong>{resumeName}</strong>
                      <span>New PDF selected · Ready to upload</span>
                    </>
                  ) : formData.resumeUrl && !removeResume ? (
                    <>
                      <strong>Resume uploaded</strong>
                      <span>Your current resume is available publicly.</span>
                    </>
                  ) : removeResume ? (
                    <>
                      <strong>Resume will be removed</strong>
                      <span>Save your profile to confirm removal.</span>
                    </>
                  ) : (
                    <>
                      <strong>No resume uploaded</strong>
                      <span>Upload a PDF resume to display it publicly.</span>
                    </>
                  )}
                </div>

                <div className="profile-resume-actions">
                  {formData.resumeUrl && !removeResume && !resumeFile && (
                    <a
                      href={formData.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-resume-view"
                    >
                      View
                    </a>
                  )}

                  {!resumeFile && !removeResume && (
                    <button
                      type="button"
                      className="profile-resume-upload-button"
                      onClick={() => resumeInputRef.current?.click()}
                    >
                      {formData.resumeUrl ? "Replace" : "Upload"}
                    </button>
                  )}

                  {resumeFile && (
                    <button
                      type="button"
                      className="profile-resume-remove-button"
                      onClick={cancelSelectedResume}
                    >
                      Cancel
                    </button>
                  )}

                  {formData.resumeUrl && !resumeFile && !removeResume && (
                    <button
                      type="button"
                      className="profile-resume-remove-button"
                      onClick={markResumeForRemoval}
                    >
                      Remove
                    </button>
                  )}

                  {removeResume && (
                    <button
                      type="button"
                      className="profile-resume-undo-button"
                      onClick={undoResumeRemoval}
                    >
                      Undo
                    </button>
                  )}
                </div>
              </div>

              <input
                ref={resumeInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleResumeChange}
                className="profile-hidden-input"
              />

              <p className="profile-field-help">
                PDF only · Maximum 10MB · Your latest uploaded resume
                will appear on the public portfolio.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Action */}
        <div className="profile-actions">
          <div className="profile-save-info">
            <span className="profile-save-dot" />

            <div>
              <strong>Ready to save</strong>
              <p>Your changes will update your portfolio profile.</p>
            </div>
          </div>

          <button
            type="submit"
            className="profile-save-button"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="profile-button-spinner" />
                Saving...
              </>
            ) : (
              <>
                <span>✓</span>
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;