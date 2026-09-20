import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/login", formData);

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-background">
        <div className="login-orb login-orb-one" />
        <div className="login-orb login-orb-two" />
        <div className="login-grid" />
      </div>

      {/* Top branding */}
      <div className="login-brand">
        <div className="login-brand-mark">R</div>

        <div className="login-brand-text">
          <strong>Rabeen</strong>
          <span>Portfolio</span>
        </div>
      </div>

      {/* Login card */}
      <main className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <span>R</span>
          </div>

          <div className="login-welcome">
            <span className="login-eyebrow">
              ADMINISTRATOR
            </span>

            <h1>Welcome back</h1>

            <p>
              Sign in to manage your portfolio
              <br />
              and keep everything up to date.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="login-email">
              Email address
            </label>

            <div className="login-input-wrapper">
              <span className="login-input-icon">
                @
              </span>

              <input
                id="login-email"
                type="email"
                name="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="password-label-row">
              <label htmlFor="login-password">
                Password
              </label>
            </div>

            <div className="login-input-wrapper">
              <span className="login-input-icon password-icon">
                •
              </span>

              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              <span className="login-error-icon">!</span>

              <div>
                <strong>Unable to sign in</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-button-spinner" />
                Signing in...
              </>
            ) : (
              <>
                <span>Sign in to dashboard</span>
                <span className="login-button-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <span className="login-status-dot" />
          <span>Secure administrator access</span>
        </div>
      </main>

      <div className="login-bottom">
        <span>© {new Date().getFullYear()} Rabeen</span>
        <span className="login-bottom-divider" />
        <span>Portfolio Administration</span>
      </div>
    </div>
  );
}

export default Login;