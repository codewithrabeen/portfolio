import { useEffect, useState } from "react";
import api from "../services/api";

function Skills() {
  const [skills, setSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);

  const [formData, setFormData] = useState({
    category: "Frontend",
    name: "",
    level: 80,
    order: 0,
    published: true,
  });

  // ================================
  // FETCH SKILLS
  // ================================

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/skills/all");

      setSkills(response.data.skills || []);
    } catch (error) {
      console.error("Fetch skills error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load skills."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // ================================
  // FORM
  // ================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      category: "Frontend",
      name: "",
      level: 80,
      order: 0,
      published: true,
    });

    setEditingSkill(null);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  // ================================
  // CREATE / UPDATE
  // ================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Skill name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        category: formData.category,
        name: formData.name.trim(),
        level: Number(formData.level),
        order: Number(formData.order),
        published: formData.published,
      };

      let response;

      if (editingSkill) {
        response = await api.put(
          `/skills/${editingSkill._id}`,
          payload
        );
      } else {
        response = await api.post(
          "/skills",
          payload
        );
      }

      if (editingSkill) {
        setSkills((current) =>
          current.map((skill) =>
            skill._id === editingSkill._id
              ? response.data.skill
              : skill
          )
        );
      } else {
        setSkills((current) => [
          response.data.skill,
          ...current,
        ]);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error(
        "Save skill error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Failed to save skill."
      );
    } finally {
      setSaving(false);
    }
  };

  // ================================
  // EDIT
  // ================================

  const handleEdit = (skill) => {
    setEditingSkill(skill);

    setFormData({
      category: skill.category || "Frontend",
      name: skill.name || "",
      level: skill.level ?? 80,
      order: skill.order ?? 0,
      published: skill.published ?? true,
    });

    setError("");
    setShowModal(true);
  };

  // ================================
  // DELETE
  // ================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this skill?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/skills/${id}`);

      setSkills((current) =>
        current.filter(
          (skill) => skill._id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete skill error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete skill."
      );
    }
  };

  // ================================
  // OPEN CREATE MODAL
  // ================================

  const openCreateModal = () => {
    resetForm();
    setError("");
    setShowModal(true);
  };

  // ================================
  // GROUP SKILLS
  // ================================

  const groupedSkills = skills.reduce(
    (groups, skill) => {
      const category = skill.category || "Other";

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(skill);

      return groups;
    },
    {}
  );

  // ================================
  // UI
  // ================================

  return (
    <div className="skills-page">

      {/* HEADER */}

      <div className="page-header">
        <div>
          <h1>Skills</h1>

          <p>
            Manage your technical skills and
            technologies
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openCreateModal}
        >
          + Add Skill
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
          Loading skills...
        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        !error &&
        skills.length === 0 && (
          <div className="empty-state">
            <h2>No skills yet</h2>

            <p>
              Add your first technical skill to
              your portfolio.
            </p>

            <button
              className="primary-button"
              onClick={openCreateModal}
            >
              + Add Your First Skill
            </button>
          </div>
        )}

      {/* SKILLS */}

      {!loading &&
        skills.length > 0 && (
          <div className="skills-admin-grid">

            {Object.entries(groupedSkills).map(
              ([category, categorySkills]) => (
                <section
                  className="skill-admin-category"
                  key={category}
                >

                  <div className="skill-admin-category-header">
                    <div>
                      <span className="skill-category-label">
                        Category
                      </span>

                      <h2>{category}</h2>
                    </div>

                    <span className="skill-count">
                      {categorySkills.length}
                    </span>
                  </div>

                  <div className="skill-admin-list">

                    {categorySkills.map(
                      (skill) => (
                        <div
                          className="skill-admin-card"
                          key={skill._id}
                        >

                          <div className="skill-admin-main">

                            <div className="skill-admin-name">
                              <h3>
                                {skill.name}
                              </h3>

                              <span
                                className={
                                  skill.published
                                    ? "published-badge"
                                    : "draft-badge"
                                }
                              >
                                {skill.published
                                  ? "Published"
                                  : "Draft"}
                              </span>
                            </div>

                            <div className="skill-level-wrapper">

                              <div className="skill-level-info">
                                <span>
                                  Proficiency
                                </span>

                                <strong>
                                  {skill.level}%
                                </strong>
                              </div>

                              <div className="skill-progress">
                                <div
                                  className="skill-progress-bar"
                                  style={{
                                    width: `${skill.level}%`,
                                  }}
                                />
                              </div>

                            </div>

                          </div>

                          <div className="skill-admin-actions">

                            <button
                              className="edit-button"
                              onClick={() =>
                                handleEdit(skill)
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() =>
                                handleDelete(
                                  skill._id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                </section>
              )
            )}

          </div>
        )}

      {/* MODAL */}

      {showModal && (
        <div
          className="modal-overlay"
          onClick={closeModal}
        >

          <div
            className="skill-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>
                <h2>
                  {editingSkill
                    ? "Edit Skill"
                    : "Add New Skill"}
                </h2>

                <p>
                  {editingSkill
                    ? "Update your skill"
                    : "Add a technology to your portfolio"}
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

            {/* FORM */}

            <form onSubmit={handleSubmit}>

              {/* CATEGORY */}

              <div className="form-group">

                <label>
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Frontend">
                    Frontend
                  </option>

                  <option value="Backend">
                    Backend
                  </option>

                  <option value="Database">
                    Database
                  </option>

                  <option value="Tools & DevOps">
                    Tools & DevOps
                  </option>

                  <option value="Languages">
                    Languages
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>

              </div>

              {/* NAME */}

              <div className="form-group">

                <label>
                  Skill Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="React.js"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* LEVEL */}

              <div className="form-group">

                <div className="label-row">

                  <label>
                    Proficiency
                  </label>

                  <span className="level-value">
                    {formData.level}%
                  </span>

                </div>

                <input
                  type="range"
                  name="level"
                  min="0"
                  max="100"
                  value={formData.level}
                  onChange={handleChange}
                  className="skill-range"
                />

                <div className="range-labels">
                  <span>Beginner</span>
                  <span>Intermediate</span>
                  <span>Advanced</span>
                </div>

              </div>

              {/* ORDER */}

              <div className="form-group">

                <label>
                  Display Order
                </label>

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
                    checked={
                      formData.published
                    }
                    onChange={handleChange}
                  />

                  <span>
                    Publish this skill
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
                    ? editingSkill
                      ? "Updating..."
                      : "Creating..."
                    : editingSkill
                    ? "Update Skill"
                    : "Create Skill"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Skills;