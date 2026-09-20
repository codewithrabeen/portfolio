import { useEffect, useState } from "react";
import api from "../services/api";

const defaultSettings = {
  portfolioName: "",
  siteTitle: "",
  email: "",
  timezone: "Asia/Kathmandu",
  language: "English",

  theme: "dark",
  accentColor: "#8b5cf6",
  maintenanceMode: false,

  emailNotifications: true,
  messageNotifications: true,
  projectNotifications: true,

  seoDescription: "",
  seoKeywords: "",
  ogImage: "",
};

function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/settings");

      setSettings({
        ...defaultSettings,
        ...(response.data?.settings || {}),
      });
    } catch (err) {
      console.error("Settings load error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load settings."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSettings((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMessage("");
  };

  const saveSettings = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await api.put("/settings", settings);

      setSettings({
        ...defaultSettings,
        ...(response.data?.settings || settings),
      });

      setMessage(
        response.data?.message ||
          "Settings updated successfully."
      );
    } catch (err) {
      console.error("Settings save error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <div className="settings-spinner" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <span className="settings-eyebrow">
            SYSTEM CONTROL
          </span>

          <h1>Settings</h1>

          <p>
            Configure your portfolio, appearance,
            notifications and search-engine metadata.
          </p>
        </div>

        <div className="settings-status">
          <span
            className={
              settings.maintenanceMode
                ? "status-dot danger"
                : "status-dot"
            }
          />

          {settings.maintenanceMode
            ? "Maintenance mode"
            : "Portfolio online"}
        </div>
      </div>

      {message && (
        <div className="settings-alert success">
          <span>✓</span>
          {message}
        </div>
      )}

      {error && (
        <div className="settings-alert error">
          <span>!</span>
          {error}
        </div>
      )}

      <form
        className="settings-form"
        onSubmit={saveSettings}
      >
        {/* =========================
            GENERAL
        ========================= */}

        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              ◈
            </div>

            <div>
              <h2>General</h2>
              <p>
                Basic information used across your
                portfolio.
              </p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-field">
              <label>Portfolio Name</label>

              <input
                name="portfolioName"
                value={settings.portfolioName}
                onChange={handleChange}
                placeholder="Rabeen Sharma"
              />

              <small>
                The main name displayed on your website.
              </small>
            </div>

            <div className="settings-field">
              <label>Site Title</label>

              <input
                name="siteTitle"
                value={settings.siteTitle}
                onChange={handleChange}
                placeholder="Rabeen Sharma — Full Stack Developer"
              />

              <small>
                Browser tab and page title.
              </small>
            </div>

            <div className="settings-field">
              <label>Contact Email</label>

              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                placeholder="hello@example.com"
              />

              <small>
                Public contact email.
              </small>
            </div>

            <div className="settings-field">
              <label>Timezone</label>

              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
              >
                <option value="Asia/Kathmandu">
                  Asia/Kathmandu
                </option>

                <option value="Asia/Kolkata">
                  Asia/Kolkata
                </option>

                <option value="UTC">
                  UTC
                </option>

                <option value="Europe/London">
                  Europe/London
                </option>

                <option value="America/New_York">
                  America/New_York
                </option>
              </select>
            </div>

            <div className="settings-field">
              <label>Language</label>

              <select
                name="language"
                value={settings.language}
                onChange={handleChange}
              >
                <option value="English">
                  English
                </option>

                <option value="Nepali">
                  Nepali
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* =========================
            APPEARANCE
        ========================= */}

        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              ✦
            </div>

            <div>
              <h2>Appearance</h2>
              <p>
                Control the visual identity of your
                portfolio.
              </p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-field">
              <label>Theme</label>

              <select
                name="theme"
                value={settings.theme}
                onChange={handleChange}
              >
                <option value="dark">
                  Dark
                </option>

                <option value="light">
                  Light
                </option>

                <option value="system">
                  System
                </option>
              </select>
            </div>

            <div className="settings-field">
              <label>Accent Color</label>

              <div className="color-control">
                <input
                  type="color"
                  name="accentColor"
                  value={settings.accentColor}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  value={settings.accentColor}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      accentColor:
                        event.target.value,
                    }))
                  }
                  placeholder="#8b5cf6"
                />
              </div>
            </div>

            <div className="settings-toggle-row">
              <div>
                <strong>Maintenance Mode</strong>

                <p>
                  Temporarily hide the public
                  portfolio while you work on it.
                </p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                />

                <span />
              </label>
            </div>
          </div>
        </section>

        {/* =========================
            NOTIFICATIONS
        ========================= */}

        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              ◉
            </div>

            <div>
              <h2>Notifications</h2>
              <p>
                Choose which portfolio events should
                generate notifications.
              </p>
            </div>
          </div>

          <div className="notification-list">
            <label className="notification-item">
              <div>
                <strong>Email Notifications</strong>
                <p>
                  Enable general email notifications.
                </p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                />
                <span />
              </label>
            </label>

            <label className="notification-item">
              <div>
                <strong>Message Notifications</strong>
                <p>
                  Notify when someone submits the
                  contact form.
                </p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  name="messageNotifications"
                  checked={
                    settings.messageNotifications
                  }
                  onChange={handleChange}
                />
                <span />
              </label>
            </label>

            <label className="notification-item">
              <div>
                <strong>Project Notifications</strong>
                <p>
                  Notify about project-related
                  activity.
                </p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  name="projectNotifications"
                  checked={
                    settings.projectNotifications
                  }
                  onChange={handleChange}
                />
                <span />
              </label>
            </label>
          </div>
        </section>

        {/* =========================
            SEO
        ========================= */}

        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              ◎
            </div>

            <div>
              <h2>SEO & Social</h2>
              <p>
                Control how your portfolio appears in
                search engines and social previews.
              </p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-field full">
              <label>Meta Description</label>

              <textarea
                name="seoDescription"
                value={settings.seoDescription}
                onChange={handleChange}
                rows="4"
                maxLength="300"
                placeholder="Describe your portfolio..."
              />

              <small>
                {settings.seoDescription.length}/300
                characters
              </small>
            </div>

            <div className="settings-field full">
              <label>SEO Keywords</label>

              <input
                name="seoKeywords"
                value={settings.seoKeywords}
                onChange={handleChange}
                placeholder="MERN Developer, React, Node.js..."
              />

              <small>
                Separate keywords using commas.
              </small>
            </div>

            <div className="settings-field full">
              <label>OG Image URL</label>

              <input
                name="ogImage"
                value={settings.ogImage}
                onChange={handleChange}
                placeholder="https://..."
              />

              <small>
                Image used when sharing your portfolio
                on social platforms.
              </small>
            </div>
          </div>
        </section>

        {/* =========================
            SAVE BAR
        ========================= */}

        <div className="settings-save-bar">
          <div>
            <strong>
              {saving
                ? "Saving changes..."
                : "Settings ready"}
            </strong>

            <span>
              Changes are stored in MongoDB.
            </span>
          </div>

          <button
            type="submit"
            className="settings-save-button"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="button-spinner" />
                Saving...
              </>
            ) : (
              <>
                Save Changes
                <span>→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;