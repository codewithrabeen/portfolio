import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  GitBranch,
  Star,
  Globe,
  Image as ImageIcon,
  Upload,
  X,
  Check,
  FolderKanban,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../services/api";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    technologies: "",
    githubUrl: "",
    liveUrl: "",
    featured: false,
    published: true,
  });

  /* =========================
     FETCH PROJECTS
  ========================= */

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/projects");

      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Fetch projects error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /* =========================
     FORM HANDLING
  ========================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =========================
     IMAGE HANDLING
  ========================= */

  const validateImage = (file) => {
    if (!file) return false;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return false;
    }

    return true;
  };

  const handleImageFile = (file) => {
    if (!validateImage(file)) return;

    setError("");

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);

    objectUrlRef.current = previewUrl;

    setImagePreview(previewUrl);

    setFormData((current) => ({
      ...current,
      image: file,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    handleImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    setDragActive(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      handleImageFile(file);
    }
  };

  /* =========================
     RESET FORM
  ========================= */

  const resetForm = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setImagePreview(null);

    setFormData({
      title: "",
      description: "",
      image: null,
      technologies: "",
      githubUrl: "",
      liveUrl: "",
      featured: false,
      published: true,
    });

    setEditingProject(null);
    setDragActive(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================
     CLOSE MODAL
  ========================= */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  /* =========================
     CREATE / UPDATE
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      setError("");

      /* -------------------------
         BASIC VALIDATION
      ------------------------- */

      if (!formData.title.trim()) {
        setError("Project title is required.");
        setSaving(false);
        return;
      }

      if (!formData.description.trim()) {
        setError("Project description is required.");
        setSaving(false);
        return;
      }

      /* -------------------------
         FORM DATA
      ------------------------- */

      const projectData = new FormData();

      projectData.append(
        "title",
        formData.title.trim()
      );

      projectData.append(
        "description",
        formData.description.trim()
      );

      const technologies = formData.technologies
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean);

      projectData.append(
        "technologies",
        JSON.stringify(technologies)
      );

      projectData.append(
        "githubUrl",
        formData.githubUrl.trim()
      );

      projectData.append(
        "liveUrl",
        formData.liveUrl.trim()
      );

      projectData.append(
        "featured",
        String(formData.featured)
      );

      projectData.append(
        "published",
        String(formData.published)
      );

      /*
       * Only send an image when the user selected
       * a NEW image.
       *
       * During editing, if image is null,
       * backend keeps the existing image.
       */

      if (formData.image instanceof File) {
        projectData.append(
          "image",
          formData.image
        );
      }

      /* -------------------------
         API REQUEST
      ------------------------- */

      let response;

      if (editingProject) {
        response = await api.put(
          `/projects/${editingProject._id}`,
          projectData
        );
      } else {
        response = await api.post(
          "/projects",
          projectData
        );
      }

      /* -------------------------
         UPDATE UI
      ------------------------- */

      if (editingProject) {
        setProjects((current) =>
          current.map((project) =>
            project._id === editingProject._id
              ? response.data.project
              : project
          )
        );
      } else {
        setProjects((current) => [
          response.data.project,
          ...current,
        ]);
      }

      /* -------------------------
         CLOSE MODAL
      ------------------------- */

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error(
        "Save project error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Failed to save project."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     EDIT PROJECT
  ========================= */

  const handleEdit = (project) => {
    if (!project) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setEditingProject(project);

    setFormData({
      title: project.title || "",
      description: project.description || "",
      image: null,
      technologies:
        Array.isArray(project.technologies)
          ? project.technologies.join(", ")
          : "",
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
      featured: Boolean(project.featured),
      published:
        project.published !== undefined
          ? Boolean(project.published)
          : true,
    });

    setImagePreview(project.image || null);

    setError("");
    setDragActive(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setShowModal(true);
  };

  /* =========================
     DELETE PROJECT
  ========================= */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/projects/${id}`);

      setProjects((currentProjects) =>
        currentProjects.filter(
          (project) => project._id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete project error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete project."
      );
    }
  };

  /* =========================
     CREATE PROJECT
  ========================= */

  const openCreateModal = () => {
    resetForm();

    setError("");
    setShowModal(true);
  };

  /* =========================
     CLEANUP
  ========================= */

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  /* =========================
     UI
  ========================= */

  return (
    <div className="projects-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="projects-header">
        <div className="projects-heading">
          <div className="projects-heading-icon">
            <FolderKanban size={19} />
          </div>

          <div>
            <h1>Projects</h1>

            <p>
              Build, organize and showcase your work.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="projects-add-button"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          <span>Add Project</span>
        </button>
      </div>

      {/* =========================
          SUMMARY
      ========================= */}

      {!loading &&
        !error &&
        projects.length > 0 && (
          <div className="projects-summary">

            <div className="projects-summary-item">
              <span className="summary-label">
                Total projects
              </span>

              <strong>
                {projects.length}
              </strong>
            </div>

            <div className="projects-summary-divider" />

            <div className="projects-summary-item">
              <span className="summary-label">
                Published
              </span>

              <strong>
                {
                  projects.filter(
                    (project) =>
                      project.published
                  ).length
                }
              </strong>
            </div>

            <div className="projects-summary-divider" />

            <div className="projects-summary-item">
              <span className="summary-label">
                Featured
              </span>

              <strong>
                {
                  projects.filter(
                    (project) =>
                      project.featured
                  ).length
                }
              </strong>
            </div>

          </div>
        )}

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="projects-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close error"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <div className="projects-loading">
          <div className="projects-loading-spinner" />

          <span>
            Loading projects...
          </span>
        </div>
      )}

      {/* =========================
          EMPTY
      ========================= */}

      {!loading &&
        !error &&
        projects.length === 0 && (
          <div className="projects-empty">

            <div className="projects-empty-icon">
              <FolderKanban size={28} />
            </div>

            <h2>No projects yet</h2>

            <p>
              Add your first project and start
              building your portfolio.
            </p>

            <button
              type="button"
              className="projects-add-button"
              onClick={openCreateModal}
            >
              <Plus size={17} />
              Add your first project
            </button>

          </div>
        )}

      {/* =========================
          PROJECT GRID
      ========================= */}

      {!loading &&
        projects.length > 0 && (
          <div className="projects-grid">

            {projects.map((project) => (
              <article
                className="project-card"
                key={project._id}
              >

                {/* IMAGE */}

                <div className="project-card-image">

                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                    />
                  ) : (
                    <div className="project-card-image-empty">
                      <ImageIcon size={30} />

                      <span>
                        No image
                      </span>
                    </div>
                  )}

                  <div className="project-card-overlay">

                    <div className="project-statuses">

                      {project.featured && (
                        <span className="project-badge featured">
                          <Star size={12} />
                          Featured
                        </span>
                      )}

                      <span
                        className={`project-badge ${
                          project.published
                            ? "published"
                            : "draft"
                        }`}
                      >
                        {project.published ? (
                          <>
                            <Eye size={12} />
                            Published
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} />
                            Draft
                          </>
                        )}
                      </span>

                    </div>

                  </div>

                </div>

                {/* CONTENT */}

                <div className="project-card-content">

                  <div className="project-card-title-row">

                    <h2 title={project.title}>
                      {project.title}
                    </h2>

                    <div className="project-card-actions">

                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-icon-button"
                          title="Open GitHub"
                        >
                          <GitBranch size={15} />
                        </a>
                      )}

                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-icon-button"
                          title="Open live project"
                        >
                          <ExternalLink size={15} />
                        </a>
                      )}

                    </div>

                  </div>

                  <p className="project-description">
                    {project.description}
                  </p>

                  {/* TECHNOLOGIES */}

                  {project.technologies?.length > 0 && (
                    <div className="project-tech-list">

                      {project.technologies
                        .slice(0, 5)
                        .map(
                          (
                            technology,
                            index
                          ) => (
                            <span
                              key={`${technology}-${index}`}
                            >
                              {technology}
                            </span>
                          )
                        )}

                      {project.technologies.length >
                        5 && (
                        <span className="project-tech-more">
                          +
                          {project.technologies
                            .length - 5}
                        </span>
                      )}

                    </div>
                  )}

                  {/* FOOTER */}

                  <div className="project-card-footer">

                    <button
                      type="button"
                      className="project-edit-button"
                      onClick={() =>
                        handleEdit(project)
                      }
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="project-delete-button"
                      onClick={() =>
                        handleDelete(
                          project._id
                        )
                      }
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>

                  </div>

                </div>

              </article>
            ))}

          </div>
        )}

      {/* =========================
          MODAL
      ========================= */}

      {showModal && (
        <div
          className="modal-overlay project-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="project-modal project-modal-modern"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="project-modal-header">

              <div className="project-modal-heading">

                <div className="project-modal-icon">
                  {editingProject ? (
                    <Pencil size={18} />
                  ) : (
                    <Plus size={18} />
                  )}
                </div>

                <div>

                  <h2>
                    {editingProject
                      ? "Edit project"
                      : "Create project"}
                  </h2>

                  <p>
                    {editingProject
                      ? "Update your project details."
                      : "Add a new project to your portfolio."}
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="project-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

            </div>

            {/* FORM */}

            <form
              className="project-form-modern"
              onSubmit={handleSubmit}
            >

              {/* =========================
                  BASIC INFO
              ========================= */}

              <div className="project-form-section">

                <div className="project-form-section-heading">

                  <span>01</span>

                  <div>
                    <h3>
                      Basic information
                    </h3>

                    <p>
                      Tell visitors what this
                      project is about.
                    </p>
                  </div>

                </div>

                <div className="project-form-fields">

                  <div className="project-form-group full">

                    <label htmlFor="project-title">
                      Project title
                    </label>

                    <input
                      id="project-title"
                      type="text"
                      name="title"
                      placeholder="AI Phishing Detector"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  <div className="project-form-group full">

                    <label htmlFor="project-description">
                      Description
                    </label>

                    <textarea
                      id="project-description"
                      name="description"
                      placeholder="Describe what you built, the problem it solves, and the technologies you used..."
                      value={
                        formData.description
                      }
                      onChange={handleChange}
                      rows="5"
                      required
                    />

                    <div className="field-hint">
                      Keep it concise but informative.
                    </div>

                  </div>

                </div>

              </div>

              {/* =========================
                  IMAGE
              ========================= */}

              <div className="project-form-section">

                <div className="project-form-section-heading">

                  <span>02</span>

                  <div>
                    <h3>
                      Project image
                    </h3>

                    <p>
                      Use a clean screenshot or
                      cover image.
                    </p>
                  </div>

                </div>

                <div
                  className={`project-upload ${
                    dragActive
                      ? "drag-active"
                      : ""
                  } ${
                    imagePreview
                      ? "has-preview"
                      : ""
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() =>
                    setDragActive(false)
                  }
                  onDrop={handleDrop}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >

                  {imagePreview ? (
                    <div className="project-upload-preview">

                      <img
                        src={imagePreview}
                        alt="Project preview"
                      />

                      <div className="project-upload-preview-overlay">

                        <div>
                          <Upload size={18} />

                          <span>
                            Click to replace image
                          </span>
                        </div>

                      </div>

                    </div>
                  ) : (
                    <div className="project-upload-empty">

                      <div className="project-upload-icon">
                        <Upload size={21} />
                      </div>

                      <strong>
                        Drop your image here
                      </strong>

                      <span>
                        or click to browse
                      </span>

                      <small>
                        JPG, PNG or WEBP · Maximum
                        5MB
                      </small>

                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    name="image"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    hidden
                  />

                </div>

                {editingProject &&
                  !formData.image &&
                  editingProject.image && (
                    <div className="current-image-note">

                      <Check size={14} />

                      <span>
                        Current image will be kept
                        unless you select a new one.
                      </span>

                    </div>
                  )}

              </div>

              {/* =========================
                  TECHNOLOGIES
              ========================= */}

              <div className="project-form-section">

                <div className="project-form-section-heading">

                  <span>03</span>

                  <div>
                    <h3>
                      Technologies
                    </h3>

                    <p>
                      Add the tools and technologies
                      used.
                    </p>
                  </div>

                </div>

                <div className="project-form-group full">

                  <label htmlFor="project-technologies">
                    Technologies
                  </label>

                  <input
                    id="project-technologies"
                    type="text"
                    name="technologies"
                    placeholder="React, Node.js, MongoDB, Express"
                    value={
                      formData.technologies
                    }
                    onChange={handleChange}
                  />

                  <div className="field-hint">
                    Separate each technology with
                    a comma.
                  </div>

                  {formData.technologies && (
                    <div className="form-tech-preview">

                      {formData.technologies
                        .split(",")
                        .map((tech) =>
                          tech.trim()
                        )
                        .filter(Boolean)
                        .map(
                          (
                            tech,
                            index
                          ) => (
                            <span
                              key={`${tech}-${index}`}
                            >
                              {tech}
                            </span>
                          )
                        )}

                    </div>
                  )}

                </div>

              </div>

              {/* =========================
                  LINKS
              ========================= */}

              <div className="project-form-section">

                <div className="project-form-section-heading">

                  <span>04</span>

                  <div>
                    <h3>
                      Project links
                    </h3>

                    <p>
                      Connect the source code and
                      live project.
                    </p>
                  </div>

                </div>

                <div className="project-links-grid">

                  <div className="project-form-group">

                    <label htmlFor="project-github">
                      GitHub repository
                    </label>

                    <div className="input-with-icon">

                      {/* GitBranch is used because
                          Github is unavailable in
                          the installed lucide version. */}

                      <GitBranch size={16} />

                      <input
                        id="project-github"
                        type="url"
                        name="githubUrl"
                        placeholder="https://github.com/..."
                        value={
                          formData.githubUrl
                        }
                        onChange={handleChange}
                      />

                    </div>

                  </div>

                  <div className="project-form-group">

                    <label htmlFor="project-live">
                      Live project
                    </label>

                    <div className="input-with-icon">

                      <Globe size={16} />

                      <input
                        id="project-live"
                        type="url"
                        name="liveUrl"
                        placeholder="https://..."
                        value={
                          formData.liveUrl
                        }
                        onChange={handleChange}
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* =========================
                  VISIBILITY
              ========================= */}

              <div className="project-form-section">

                <div className="project-form-section-heading">

                  <span>05</span>

                  <div>
                    <h3>
                      Visibility
                    </h3>

                    <p>
                      Control how this project
                      appears.
                    </p>
                  </div>

                </div>

                <div className="project-settings-grid">

                  {/* FEATURED */}

                  <label
                    className={`project-setting ${
                      formData.featured
                        ? "active"
                        : ""
                    }`}
                  >

                    <input
                      type="checkbox"
                      name="featured"
                      checked={
                        formData.featured
                      }
                      onChange={handleChange}
                    />

                    <div className="setting-icon">
                      <Star size={17} />
                    </div>

                    <div className="setting-copy">

                      <strong>
                        Featured project
                      </strong>

                      <span>
                        Highlight this project
                        on your portfolio.
                      </span>

                    </div>

                    <div className="setting-check">

                      {formData.featured && (
                        <Check size={13} />
                      )}

                    </div>

                  </label>

                  {/* PUBLISHED */}

                  <label
                    className={`project-setting ${
                      formData.published
                        ? "active"
                        : ""
                    }`}
                  >

                    <input
                      type="checkbox"
                      name="published"
                      checked={
                        formData.published
                      }
                      onChange={handleChange}
                    />

                    <div className="setting-icon">

                      {formData.published ? (
                        <Eye size={17} />
                      ) : (
                        <EyeOff size={17} />
                      )}

                    </div>

                    <div className="setting-copy">

                      <strong>
                        {formData.published
                          ? "Published"
                          : "Draft"}
                      </strong>

                      <span>
                        {formData.published
                          ? "Visible on your public portfolio."
                          : "Hidden from your public portfolio."}
                      </span>

                    </div>

                    <div className="setting-check">

                      {formData.published && (
                        <Check size={13} />
                      )}

                    </div>

                  </label>

                </div>

              </div>

              {/* =========================
                  FOOTER
              ========================= */}

              <div className="project-form-footer">

                <button
                  type="button"
                  className="project-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="project-save-button"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <span className="button-spinner" />

                      {editingProject
                        ? "Updating..."
                        : "Creating..."}
                    </>
                  ) : (
                    <>
                      {editingProject
                        ? "Update project"
                        : "Create project"}

                      <Check size={16} />
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </div>
  );
}

export default Projects;