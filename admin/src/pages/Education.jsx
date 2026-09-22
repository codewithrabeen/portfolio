import { useEffect, useState } from "react";
import api from "../services/api";

function Education() {
  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);

  const [formData, setFormData] = useState({
    degree: "",
    institution: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    subjects: "",
    order: 0,
    published: true,
  });

  const fetchEducations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/education/all");

      setEducations(response.data.educations || []);
    } catch (error) {
      console.error("Fetch education error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load education."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducations();
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
      degree: "",
      institution: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      subjects: "",
      order: 0,
      published: true,
    });

    setEditingEducation(null);
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

  const handleEdit = (education) => {
    setEditingEducation(education);

    setFormData({
      degree: education.degree || "",
      institution: education.institution || "",
      startDate: education.startDate || "",
      endDate: education.endDate || "",
      current: education.current ?? false,
      description: education.description || "",
      subjects: education.subjects?.join(", ") || "",
      order: education.order ?? 0,
      published: education.published ?? true,
    });

    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.degree.trim() ||
      !formData.institution.trim() ||
      !formData.startDate.trim() ||
      !formData.description.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const subjects = formData.subjects
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean);

      const payload = {
        degree: formData.degree.trim(),
        institution: formData.institution.trim(),
        startDate: formData.startDate.trim(),
        endDate: formData.current
          ? ""
          : formData.endDate.trim(),
        current: formData.current,
        description: formData.description.trim(),
        subjects,
        order: Number(formData.order),
        published: formData.published,
      };

      let response;

      if (editingEducation) {
        response = await api.put(
          `/education/${editingEducation._id}`,
          payload
        );
      } else {
        response = await api.post(
          "/education",
          payload
        );
      }

      if (editingEducation) {
        setEducations((current) =>
          current.map((education) =>
            education._id === editingEducation._id
              ? response.data.education
              : education
          )
        );
      } else {
        setEducations((current) => [
          response.data.education,
          ...current,
        ]);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error(
        "Save education error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Failed to save education."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this education record?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/education/${id}`);

      setEducations((current) =>
        current.filter(
          (education) => education._id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete education error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete education."
      );
    }
  };

  return (
    <div className="education-page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Education</h1>
          <p>
            Manage your academic background and
            qualifications
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openCreateModal}
        >
          + Add Education
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
          Loading education...
        </div>
      )}

      {/* EMPTY */}
      {!loading &&
        !error &&
        educations.length === 0 && (
          <div className="empty-state">
            <h2>No education yet</h2>

            <p>
              Add your academic background to your
              portfolio.
            </p>

            <button
              className="primary-button"
              onClick={openCreateModal}
            >
              + Add Your Education
            </button>
          </div>
        )}

      {/* EDUCATION LIST */}
      {!loading && educations.length > 0 && (
        <div className="education-admin-list">
          {educations.map((education, index) => (
            <article
              className="education-admin-card"
              key={education._id}
            >
              <div className="education-card-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="education-card-content">
                <div className="education-card-top">
                  <div>
                    <span className="education-card-label">
                      {education.startDate}
                      {" — "}
                      {education.current
                        ? "Present"
                        : education.endDate ||
                          "N/A"}
                    </span>

                    <h2>{education.degree}</h2>

                    <h3>
                      {education.institution}
                    </h3>
                  </div>

                  <span
                    className={
                      education.published
                        ? "published-badge"
                        : "draft-badge"
                    }
                  >
                    {education.published
                      ? "Published"
                      : "Draft"}
                  </span>
                </div>

                <p className="education-card-description">
                  {education.description}
                </p>

                {education.subjects?.length > 0 && (
                  <div className="education-tags">
                    {education.subjects.map(
                      (subject) => (
                        <span key={subject}>
                          {subject}
                        </span>
                      )
                    )}
                  </div>
                )}

                <div className="education-card-actions">
                  <button
                    className="edit-button"
                    onClick={() =>
                      handleEdit(education)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() =>
                      handleDelete(education._id)
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
            className="education-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>
                  {editingEducation
                    ? "Edit Education"
                    : "Add Education"}
                </h2>

                <p>
                  Add details about your academic
                  background.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close education form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* DEGREE */}
              <div className="form-group">
                <label>Degree / Qualification *</label>

                <input
                  type="text"
                  name="degree"
                  placeholder="Bachelor of Information Technology"
                  value={formData.degree}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* INSTITUTION */}
              <div className="form-group">
                <label>Institution *</label>

                <input
                  type="text"
                  name="institution"
                  placeholder="Tribhuvan University"
                  value={formData.institution}
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
                    placeholder="2023"
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
                      placeholder="2027"
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
                    I am currently studying here
                  </span>
                </label>
              </div>

              {/* DESCRIPTION */}
              <div className="form-group">
                <label>Description *</label>

                <textarea
                  name="description"
                  rows="5"
                  placeholder="Describe your studies, focus areas and academic achievements..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* SUBJECTS */}
              <div className="form-group">
                <label>Subjects / Focus Areas</label>

                <input
                  type="text"
                  name="subjects"
                  placeholder="Software Engineering, Web Development, Database"
                  value={formData.subjects}
                  onChange={handleChange}
                />

                <small>
                  Separate subjects with commas.
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
                    Publish this education
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
                    ? editingEducation
                      ? "Updating..."
                      : "Creating..."
                    : editingEducation
                    ? "Update Education"
                    : "Create Education"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Education;
