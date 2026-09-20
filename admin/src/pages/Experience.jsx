import { useEffect, useState } from "react";
import api from "../services/api";

function Experience() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    technologies: "",
    order: 0,
    published: true,
  });

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/experiences/all");

      setExperiences(response.data.experiences || []);
    } catch (error) {
      console.error("Fetch experiences error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load experiences."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      technologies: "",
      order: 0,
      published: true,
    });

    setEditingExperience(null);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  const openCreateModal = () => {
    resetForm();
    setError("");
    setShowModal(true);
  };

  const handleEdit = (experience) => {
    setEditingExperience(experience);

    setFormData({
      title: experience.title || "",
      company: experience.company || "",
      startDate: experience.startDate || "",
      endDate: experience.endDate || "",
      current: experience.current ?? false,
      description: experience.description || "",
      technologies:
        experience.technologies?.join(", ") || "",
      order: experience.order ?? 0,
      published: experience.published ?? true,
    });

    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.company.trim() ||
      !formData.startDate.trim() ||
      !formData.description.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const technologies = formData.technologies
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        startDate: formData.startDate.trim(),
        endDate: formData.current
          ? ""
          : formData.endDate.trim(),
        current: formData.current,
        description: formData.description.trim(),
        technologies,
        order: Number(formData.order),
        published: formData.published,
      };

      let response;

      if (editingExperience) {
        response = await api.put(
          `/experiences/${editingExperience._id}`,
          payload
        );
      } else {
        response = await api.post(
          "/experiences",
          payload
        );
      }

      if (editingExperience) {
        setExperiences((current) =>
          current.map((experience) =>
            experience._id === editingExperience._id
              ? response.data.experience
              : experience
          )
        );
      } else {
        setExperiences((current) => [
          response.data.experience,
          ...current,
        ]);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error(
        "Save experience error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Failed to save experience."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this experience?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/experiences/${id}`);

      setExperiences((current) =>
        current.filter(
          (experience) => experience._id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete experience error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete experience."
      );
    }
  };

  return (
    <div className="experience-page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Experience</h1>
          <p>
            Manage your professional experience and career
            journey
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openCreateModal}
        >
          + Add Experience
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="loading">
          Loading experiences...
        </div>
      )}

      {/* EMPTY */}
      {!loading &&
        !error &&
        experiences.length === 0 && (
          <div className="empty-state">
            <h2>No experience yet</h2>

            <p>
              Add your first professional experience to
              your portfolio.
            </p>

            <button
              className="primary-button"
              onClick={openCreateModal}
            >
              + Add Your First Experience
            </button>
          </div>
        )}

      {/* EXPERIENCE LIST */}
      {!loading && experiences.length > 0 && (
        <div className="experience-admin-list">
          {experiences.map((experience, index) => (
            <article
              className="experience-admin-card"
              key={experience._id}
            >
              <div className="experience-card-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="experience-card-content">
                <div className="experience-card-top">
                  <div>
                    <span className="experience-card-label">
                      {experience.startDate}{" "}
                      —{" "}
                      {experience.current
                        ? "Present"
                        : experience.endDate ||
                          "N/A"}
                    </span>

                    <h2>{experience.title}</h2>

                    <h3>{experience.company}</h3>
                  </div>

                  <span
                    className={
                      experience.published
                        ? "published-badge"
                        : "draft-badge"
                    }
                  >
                    {experience.published
                      ? "Published"
                      : "Draft"}
                  </span>
                </div>

                <p className="experience-card-description">
                  {experience.description}
                </p>

                {experience.technologies?.length > 0 && (
                  <div className="experience-tags">
                    {experience.technologies.map(
                      (tech) => (
                        <span key={tech}>
                          {tech}
                        </span>
                      )
                    )}
                  </div>
                )}

                <div className="experience-card-actions">
                  <button
                    className="edit-button"
                    onClick={() =>
                      handleEdit(experience)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() =>
                      handleDelete(experience._id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={closeModal}
        >
          <div
            className="experience-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>
                  {editingExperience
                    ? "Edit Experience"
                    : "Add Experience"}
                </h2>

                <p>
                  Add details about your professional
                  experience.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* TITLE */}
              <div className="form-group">
                <label>Job Title *</label>

                <input
                  type="text"
                  name="title"
                  placeholder="Backend Developer"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* COMPANY */}
              <div className="form-group">
                <label>Company *</label>

                <input
                  type="text"
                  name="company"
                  placeholder="Company Name"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* DATES */}
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>

                  <input
                    type="text"
                    name="startDate"
                    placeholder="Jan 2026"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                {!formData.current && (
                  <div className="form-group">
                    <label>End Date</label>

                    <input
                      type="text"
                      name="endDate"
                      placeholder="Jun 2026"
                      value={formData.endDate}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>

              {/* CURRENT */}
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="current"
                    checked={formData.current}
                    onChange={handleChange}
                  />

                  <span>
                    I currently work here
                  </span>
                </label>
              </div>

              {/* DESCRIPTION */}
              <div className="form-group">
                <label>Description *</label>

                <textarea
                  name="description"
                  rows="5"
                  placeholder="Describe your responsibilities, achievements and work..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* TECHNOLOGIES */}
              <div className="form-group">
                <label>Technologies</label>

                <input
                  type="text"
                  name="technologies"
                  placeholder="React, Node.js, MongoDB"
                  value={formData.technologies}
                  onChange={handleChange}
                />

                <small>
                  Separate technologies with commas.
                </small>
              </div>

              {/* ORDER */}
              <div className="form-group">
                <label>Display Order</label>

                <input
                  type="number"
                  name="order"
                  min="0"
                  value={formData.order}
                  onChange={handleChange}
                />

                <small>
                  Lower numbers appear first.
                </small>
              </div>

              {/* PUBLISHED */}
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleChange}
                  />

                  <span>
                    Publish this experience
                  </span>
                </label>
              </div>

              {/* ACTIONS */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? editingExperience
                      ? "Updating..."
                      : "Creating..."
                    : editingExperience
                    ? "Update Experience"
                    : "Create Experience"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Experience;