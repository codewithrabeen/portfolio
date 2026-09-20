
import { useEffect, useMemo, useState } from "react";
import api from "./api";
import "./App.css";

const DEFAULT_SETTINGS = {
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

/* Safely read list responses even if an endpoint returns an array directly. */
const readList = (response, key) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];

  return [];
};


/* =========================
   ICONS
========================= */

const Arrow = ({ size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 12h13"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="m13 6 6 6-6 6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Download = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Github = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.2-.35 6.5-1.55 6.5-7A5.5 5.5 0 0 0 19 3.7 5.1 5.1 0 0 0 18.9 0S17.7-.4 15 1.4a13.4 13.4 0 0 0-6 0C6.3-.4 5.1 0 5.1 0A5.1 5.1 0 0 0 5 3.7a5.5 5.5 0 0 0-1.5 3.8c0 5.45 3.3 6.65 6.5 7A4.8 4.8 0 0 0 9 18v4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 18c-4.5 2-5-2-7-2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const Linkedin = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M8 11v6M8 8v.01M12 17v-6M12 14a3 3 0 0 1 6 0v3"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const Mail = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="m4 7 8 6 8-6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const Menu = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4 7h16M4 12h16M4 17h16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const FileText = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 2v6h6M8 13h8M8 17h6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ExternalLink = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M14 5h5v5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 5 11 13"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ExternalArrow = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M7 17 17 7M9 7h8v8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* =========================
   APP
========================= */

function App() {
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);

  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [mobileMenu, setMobileMenu] = useState(false);
  const [active, setActive] = useState("home");

  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  /* =========================
     LOAD PORTFOLIO
  ========================= */

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        profileRes,
        projectRes,
        skillRes,
        experienceRes,
        educationRes,
      ] = await Promise.all([
        api.get("/profile"),
        api.get("/projects"),
        api.get("/skills"),
        api.get("/experiences"),
        api.get("/education"),
      ]);

      const nextProfile = profileRes.data?.profile;

      if (!nextProfile) {
        throw new Error("No profile data returned from API.");
      }

      setProfile(nextProfile);

      // The public page uses the data returned by the public APIs directly.
      // This prevents admin/profile fallback values such as 0 from hiding
      // the real number of published records.
      setProjects(readList(projectRes, "projects"));
      setSkills(readList(skillRes, "skills"));
      setExperiences(readList(experienceRes, "experiences"));
      setEducations(readList(educationRes, "educations"));

      /* =========================
         LOAD SETTINGS
      ========================= */

      try {
        const settingsRes = await api.get("/settings");

        const nextSettings = {
          ...DEFAULT_SETTINGS,
          ...(settingsRes.data?.settings || {}),
        };

        setSettings(nextSettings);

        /* =========================
           DOCUMENT TITLE
        ========================= */

        document.title =
          nextSettings?.siteTitle ||
          nextProfile.seoTitle ||
          `${nextProfile.name || "Rabeen"} — ${
            nextProfile.title || "Full Stack Developer"
          }`;

        /* =========================
           SEO DESCRIPTION
        ========================= */

        const description =
          document.querySelector(
            'meta[name="description"]'
          );

        if (description) {
          description.content =
            nextSettings?.seoDescription ||
            nextProfile.seoDescription ||
            nextProfile.bio ||
            `${nextProfile.name || "Rabeen"} — ${
              nextProfile.title ||
              "Full Stack Developer"
            }`;
        }

        /* =========================
           SEO KEYWORDS
        ========================= */

        const keywords =
          document.querySelector(
            'meta[name="keywords"]'
          );

        if (keywords) {
          keywords.content =
            nextSettings?.seoKeywords ||
            "";
        }

        /* =========================
           OPEN GRAPH TITLE
        ========================= */

        const ogTitle =
          document.querySelector(
            'meta[property="og:title"]'
          );

        if (ogTitle) {
          ogTitle.content =
            nextSettings?.siteTitle ||
            nextProfile.seoTitle ||
            nextProfile.name ||
            "Rabeen Sharma";
        }

        /* =========================
           OPEN GRAPH DESCRIPTION
        ========================= */

        const ogDescription =
          document.querySelector(
            'meta[property="og:description"]'
          );

        if (ogDescription) {
          ogDescription.content =
            nextSettings?.seoDescription ||
            nextProfile.seoDescription ||
            nextProfile.bio ||
            "";
        }

        /* =========================
           OPEN GRAPH IMAGE
        ========================= */

        const ogImage =
          document.querySelector(
            'meta[property="og:image"]'
          );

        if (ogImage) {
          ogImage.content =
            nextSettings?.ogImage ||
            nextProfile.profileImage ||
            "/favicon.png";
        }

        /* =========================
           TWITTER TITLE
        ========================= */

        const twitterTitle =
          document.querySelector(
            'meta[name="twitter:title"]'
          );

        if (twitterTitle) {
          twitterTitle.content =
            nextSettings?.siteTitle ||
            nextProfile.seoTitle ||
            nextProfile.name ||
            "Rabeen Sharma";
        }

        /* =========================
           TWITTER DESCRIPTION
        ========================= */

        const twitterDescription =
          document.querySelector(
            'meta[name="twitter:description"]'
          );

        if (twitterDescription) {
          twitterDescription.content =
            nextSettings?.seoDescription ||
            nextProfile.seoDescription ||
            nextProfile.bio ||
            "";
        }

        /* =========================
           TWITTER IMAGE
        ========================= */

        const twitterImage =
          document.querySelector(
            'meta[name="twitter:image"]'
          );

        if (twitterImage) {
          twitterImage.content =
            nextSettings?.ogImage ||
            nextProfile.profileImage ||
            "/favicon.png";
        }
      } catch (settingsError) {
        console.warn(
          "Settings could not be loaded. Using profile defaults.",
          settingsError
        );

        setSettings(null);

        document.title =
          nextProfile.seoTitle ||
          `${nextProfile.name || "Rabeen"} — ${
            nextProfile.title ||
            "Full Stack Developer"
          }`;

        const description =
          document.querySelector(
            'meta[name="description"]'
          );

        if (description) {
          description.content =
            nextProfile.seoDescription ||
            nextProfile.bio ||
            `${nextProfile.name || "Rabeen"} — ${
              nextProfile.title ||
              "Full Stack Developer"
            }`;
        }
      }
    } catch (err) {
      console.error(
        "Portfolio loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to connect to the portfolio server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  /* =========================
     APPLY SETTINGS
  ========================= */

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;

    const savedTheme =
      settings.theme || "dark";

    /*
      Theme
      dark  → dark
      light → light
      system → user's OS preference
    */

    let resolvedTheme = savedTheme;

    if (savedTheme === "system") {
      resolvedTheme =
        window.matchMedia &&
        window.matchMedia(
          "(prefers-color-scheme: light)"
        ).matches
          ? "light"
          : "dark";
    }

    root.setAttribute(
      "data-theme",
      resolvedTheme
    );

    /* Accent color */

    if (settings.accentColor) {
      root.style.setProperty(
        "--portfolio-accent",
        settings.accentColor
      );
    }

    // Keep document metadata aligned with the Settings panel.
    root.lang =
      settings.language === "Nepali" ? "ne" : "en";

    if (settings.timezone) {
      root.setAttribute(
        "data-timezone",
        settings.timezone
      );
    }

    return () => {
      root.removeAttribute("data-theme");
      root.removeAttribute("data-timezone");
      root.style.removeProperty(
        "--portfolio-accent"
      );
    };
  }, [settings]);

  /* =========================
     SECTION OBSERVER
  ========================= */

  useEffect(() => {
    if (loading) return;

    const ids = [
      "home",
      "about",
      "skills",
      "projects",
      "journey",
      "contact",
    ];

    const observers = ids
      .map((id) => {
        const element =
          document.getElementById(id);

        if (!element) return null;

        const observer =
          new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                setActive(id);

                api
                  .post("/visits", {
                    path: `/${id}`,
                  })
                  .catch(() => {});
              }
            },
            {
              rootMargin:
                "-25% 0px -55% 0px",
            }
          );

        observer.observe(element);

        return observer;
      })
      .filter(Boolean);

    return () => {
      observers.forEach((observer) =>
        observer.disconnect()
      );
    };
  }, [loading]);

  /* =========================
     GROUP SKILLS
  ========================= */

  const groupedSkills = useMemo(
    () =>
      skills.reduce(
        (groups, skill) => {
          const category =
            skill.category || "Other";

          if (!groups[category]) {
            groups[category] = [];
          }

          groups[category].push(skill);

          return groups;
        },
        {}
      ),
    [skills]
  );

  /* =========================
     CONTACT FORM
  ========================= */

  const submitContact = async (event) => {
    event.preventDefault();

    try {
      setSending(true);
      setMessage("");

      await api.post("/messages", form);

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setMessage(
        "Message sent successfully."
      );
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Could not send your message. Please try again."
      );
    } finally {
      setSending(false);

      setTimeout(() => {
        setMessage("");
      }, 4500);
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="page-state">
        <div className="state-loader" />

        <span>
          Loading portfolio
          <span className="loading-dots">
            ...
          </span>
        </span>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error || !profile) {
    return (
      <div className="page-state">
        <div className="error-box">
          <div className="error-code">
            503
          </div>

          <h1>
            {profile
              ? "Connection issue"
              : "No profile found"}
          </h1>

          <p>
            {error ||
              "Add your profile from the admin panel and refresh the page."}
          </p>

          <button
            onClick={loadPortfolio}
            className="button button-light"
          >
            Try again
            <Arrow size={15} />
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     PUBLIC PROFILE CHECK
  ========================= */

  if (profile.publicProfile === false) {
    return (
      <div className="page-state">
        <div className="error-box">
          <div className="error-code">
            PRIVATE
          </div>

          <h1>
            Portfolio unavailable
          </h1>

          <p>
            This public profile is currently
            disabled.
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     MAINTENANCE MODE
  ========================= */

  if (settings?.maintenanceMode === true) {
    return (
      <div className="page-state maintenance-state">
        <div className="error-box maintenance-box">
          <div className="error-code">
            503
          </div>

          <h1>
            {settings.portfolioName ||
              profile.name ||
              "Portfolio"}{" "}
            is getting an upgrade.
          </h1>

          <p>
            The portfolio is temporarily
            unavailable while some updates
            are being deployed.
          </p>

          {showContactEmail(
            profile,
            settings
          ) && (
            <a
              href={`mailto:${
                settings.email ||
                profile.email
              }`}
              className="button button-light"
            >
              Get in touch
              <Mail size={15} />
            </a>
          )}
        </div>
      </div>
    );
  }

  /* =========================
     DATA
  ========================= */

  const resume =
    profile.resumeUrl || "/resume.pdf";

  // Settings are the site-wide public overrides. Profile remains the fallback.
  const displayName =
    settings?.portfolioName ||
    profile.name ||
    "Rabeen";

  const contactEmail =
    settings?.email ||
    profile.email ||
    "";

  const heroSkills = [
    "Node.js",
    "Express.js",
    "REST API",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
  ];

  // These hero counters reflect the actual public data arrays.
  // Profile fields may contain their default value of 0, so they must not
  // override real project/experience records.
  const projectCount = projects.length;
  const skillCount = skills.length;
  const experienceCount = experiences.length;

  const navItems = [
    ["home", "Home"],
    ["about", "About"],
    ["skills", "Skills"],
    ["projects", "Projects"],
    ["journey", "Journey"],
    ["contact", "Contact"],
  ];

  const showEmail =
    profile.showEmail !== false;

  const showPhone =
    profile.showPhone === true;

  return (
    <div className="portfolio-page">
      <div className="page-noise" />

      <div className="ambient ambient-purple" />
      <div className="ambient ambient-blue" />

      {/* =========================
          NAVIGATION
      ========================= */}

      <header className="navbar">
        <a
          href="#home"
          className="navbar-brand"
          onClick={() =>
            setMobileMenu(false)
          }
        >
          <span className="brand-square brand-logo-wrap">
            <img
              src="/favicon.png"
              alt={`${displayName} logo`}
              className="brand-logo-image"
            />
          </span>

          <span>
            {displayName}
          </span>
        </a>

        <nav
          className={`navbar-nav ${
            mobileMenu
              ? "is-open"
              : ""
          }`}
        >
          {navItems.map(
            ([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className={
                  active === id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setMobileMenu(false)
                }
              >
                {label}
              </a>
            )
          )}
        </nav>

        <div className="navbar-right">
          <a
            href={resume}
            target="_blank"
            rel="noreferrer"
            className="resume-button"
          >
            Resume
            <Download size={14} />
          </a>

          <button
            className="menu-button"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenu}
            onClick={() =>
              setMobileMenu(
                (value) => !value
              )
            }
          >
            <Menu />
          </button>
        </div>
      </header>

      {/* =========================
          HERO
      ========================= */}

      <section
        id="home"
        className="hero-section"
      >
        <div className="hero-background-grid" />
        <div className="hero-vignette" />

        <div className="hero-content">
          <div className="hero-left">
            <div className="availability-pill">
              <span className="availability-dot" />

              {profile.availability ||
                "Available for opportunities"}
            </div>

            <div className="hero-kicker">
              HELLO, I'M
            </div>

            <h1 className="hero-name">
              {displayName
                ?.split(" ")
                .map(
                  (part, index) => (
                    <span
                      key={`${part}-${index}`}
                    >
                      {part}

                      {index <
                      displayName.split(
                        " "
                      ).length -
                        1 ? (
                        <br />
                      ) : null}
                    </span>
                  )
                )}

              <b>.</b>
            </h1>

            <div className="hero-role">
              {profile.title ||
                "Full Stack Developer"}
            </div>

            <p className="hero-description">
              {profile.bio ||
                "I design and build modern web applications, reliable backend systems and thoughtful digital experiences that turn ideas into useful products."}
            </p>

            <p className="hero-supporting-text">
              {profile.currentlyLearning
                ? `Currently learning: ${profile.currentlyLearning}`
                : "Turning ideas into interfaces. Turning interfaces into products."}
            </p>

            <div className="hero-buttons">
              <a
                href="#projects"
                className="button button-light"
              >
                View My Work
                <Arrow />
              </a>

 <a
  href={profile.resumeUrl || "/resume.pdf"}
  target="_blank"
  rel="noopener noreferrer"
  className="hero-resume-button"
>
  <FileText size={16} />
  {profile.resumeUrl ? "View Resume" : "Download Resume"}
  <ExternalLink size={14} />
</a>
            </div>

            {/* HERO STATS */}

            <div className="hero-stats">
              <div className="hero-stat">
                <strong>
                  {String(
                    projectCount
                  ).padStart(2, "0")}
                </strong>

                <span>
                  Projects
                </span>
              </div>

              <div className="hero-stat">
                <strong>
                  {String(
                    skillCount
                  ).padStart(2, "0")}
                </strong>

                <span>
                  Technologies
                </span>
              </div>

              <div className="hero-stat">
                <strong>
                  {String(
                    experienceCount
                  ).padStart(2, "0")}
                </strong>

                <span>
                  Experience
                </span>
              </div>
            </div>

            {/* SOCIALS */}

            <div className="hero-socials">
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                >
                  <Github />
                </a>
              )}

              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                >
                  <Linkedin />
                </a>
              )}

              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Website"
                >
                  <ExternalArrow
                    size={18}
                  />
                </a>
              )}

              {contactEmail &&
                showEmail && (
                  <a
                    href={`mailto:${contactEmail}`}
                    aria-label="Email"
                  >
                    <Mail />
                  </a>
                )}
            </div>
          </div>

          {/* HERO ART */}

          <div className="hero-art">
            <div className="hero-glow" />

            <div className="orbit orbit-1" />
            <div className="orbit orbit-2" />
            <div className="orbit orbit-3" />

            <div className="orbit-dot dot-one" />
            <div className="orbit-dot dot-two" />
            <div className="orbit-dot dot-three" />

            <div className="portrait-frame">
              <div className="portrait-inner">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={
                      displayName ||
                      "Profile"
                    }
                  />
                ) : (
                  <div className="portrait-fallback">
                    {displayName
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      "R"}
                  </div>
                )}
              </div>
            </div>

            {heroSkills.map(
              (skill, index) => (
                <div
                  key={skill}
                  className={`floating-tech tech-${
                    index + 1
                  }`}
                >
                  <span
                    className={`tech-logo logo-${
                      index + 1
                    }`}
                  >
                    {skill ===
                    "Node.js"
                      ? "JS"
                      : skill ===
                        "Express.js"
                        ? "ex"
                        : skill ===
                          "REST API"
                        ? "{}"
                        : skill ===
                          "PostgreSQL"
                        ? "◉"
                        : skill ===
                          "MySQL"
                        ? "◆"
                        : "M"}
                  </span>

                  {skill}
                </div>
              )
            )}

            {/* TERMINAL */}

            <div className="terminal-card">
              <div className="terminal-top">
                <div className="traffic-lights">
                  <i />
                  <i />
                  <i />
                </div>

                <span>
                  portfolio.js
                </span>
              </div>

              <div className="terminal-code">
                <div>
                  <span className="code-purple">
                    const
                  </span>{" "}
                  developer ={" "}
                  <span className="code-green">
                    "{displayName}"
                  </span>
                  ;
                </div>

                <div>
                  <span className="code-purple">
                    const
                  </span>{" "}
                  stack ={" "}
                  <span className="code-blue">
                    "MERN"
                  </span>
                  ;
                </div>

                <div>
                  <span className="code-purple">
                    return
                  </span>{" "}
                  <span className="code-pink">
                    build
                  </span>
                  (
                  <span className="code-green">
                    "great things"
                  </span>
                  );
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-cue">
          <span>
            SCROLL TO EXPLORE
          </span>

          <i />
        </div>
      </section>

      {/* =========================
          ABOUT
      ========================= */}

      <section
        id="about"
        className="content-section about-section"
      >
        <div className="section-label">
          <span>01</span>
          ABOUT
        </div>

        <div className="about-layout">
          <div className="section-heading-block">
            <div className="small-purple">
              WHO I AM
            </div>

            <h2>
              Building things that are{" "}
              <span>useful.</span>
            </h2>
          </div>

          <div className="about-text">
            <p>
              {profile.bio ||
                "I'm a full-stack developer who enjoys turning complex ideas into clean, reliable and intuitive digital products."}
            </p>

            <p>
              I care about thoughtful
              interfaces, solid backend
              architecture and the small
              details that make software
              feel polished.
            </p>

            <p>
              From REST APIs and databases
              to responsive React
              interfaces, I enjoy working
              across the stack and
              understanding how every piece
              of a product connects.
            </p>

            <p>
              My approach is simple:
              understand the problem, build
              with purpose, test what matters
              and keep improving the result.
            </p>

            <div className="about-details">
              {profile.location && (
                <div>
                  <small>
                    BASED IN
                  </small>

                  <strong>
                    {profile.location}
                  </strong>
                </div>
              )}

              {contactEmail &&
                showEmail && (
                  <div>
                    <small>
                      EMAIL
                    </small>

                    <a
                      href={`mailto:${contactEmail}`}
                    >
                      {contactEmail}
                    </a>
                  </div>
                )}

              {profile.phone &&
                showPhone && (
                  <div>
                    <small>
                      PHONE
                    </small>

                    <a
                      href={`tel:${profile.phone}`}
                    >
                      {profile.phone}
                    </a>
                  </div>
                )}

              <div>
                <small>
                  FOCUS
                </small>

                <strong>
                  Full Stack · Backend · AI
                </strong>
              </div>

              {profile.currentlyLearning && (
                <div>
                  <small>
                    CURRENTLY LEARNING
                  </small>

                  <strong>
                    {profile.currentlyLearning}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          SKILLS
      ========================= */}

      <section
        id="skills"
        className="content-section"
      >
        <div className="section-label">
          <span>02</span>
          TECH STACK
        </div>

        <div className="section-heading-row">
          <div>
            <div className="small-purple">
              MY TOOLKIT
            </div>

            <h2>
              Tools I use to{" "}
              <span>build.</span>
            </h2>
          </div>

          <p>
            A growing toolkit built around
            modern JavaScript, backend
            engineering, databases and
            practical product development.
          </p>
        </div>

        <div className="skills-showcase">
          {Object.entries(
            groupedSkills
          ).map(
            (
              [
                category,
                categorySkills,
              ],
              index
            ) => (
              <article
                className="skill-panel"
                key={category}
              >
                <div className="skill-panel-number">
                  {String(
                    index + 1
                  ).padStart(2, "0")}
                </div>

                <h3>
                  {category}
                </h3>

                <p className="skill-panel-description">
                  Technologies I use while
                  designing, developing and
                  improving digital products.
                </p>

                <div className="skill-items">
                  {categorySkills.map(
                    (skill) => (
                      <span
                        key={
                          skill._id
                        }
                      >
                        {skill.name}
                      </span>
                    )
                  )}
                </div>
              </article>
            )
          )}
        </div>

        {!skills.length && (
          <div className="empty-panel">
            <span>
              02
            </span>

            <h3>
              The toolkit is being
              assembled.
            </h3>

            <p>
              Add your technologies from
              the admin panel to showcase
              your development stack.
            </p>
          </div>
        )}
      </section>

      {/* =========================
          PROJECTS
      ========================= */}

      <section
        id="projects"
        className="content-section projects-section"
      >
        <div className="section-label">
          <span>03</span>
          SELECTED WORK
        </div>

        <div className="section-heading-row">
          <div>
            <div className="small-purple">
              RECENT BUILDS
            </div>

            <h2>
              Work that{" "}
              <span>speaks.</span>
            </h2>
          </div>

          <p>
            A selection of applications
            and experiments built while
            exploring ideas, technologies
            and better ways to solve
            problems.
          </p>
        </div>

        <div className="projects-list">
          {projects
            .slice(0, 5)
            .map(
              (
                project,
                index
              ) => (
                <article
                  key={
                    project._id
                  }
                  className={`project-showcase ${
                    project.featured
                      ? "featured-project"
                      : ""
                  }`}
                >
                  <div className="project-visual">
                    {project.image ? (
                      <img
                        src={
                          project.image
                        }
                        alt={
                          project.title
                        }
                      />
                    ) : (
                      <div className="project-placeholder">
                        <span>
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>
                      </div>
                    )}

                    {project.featured && (
                      <div className="featured-chip">
                        FEATURED
                      </div>
                    )}

                    <div className="project-index">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>
                  </div>

                  <div className="project-info">
                    <div className="small-purple">
                      PROJECT{" "}
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <h3>
                      {
                        project.title
                      }
                    </h3>

                    <p>
                      {project.description ||
                        "A carefully built digital product focused on solving a real problem through thoughtful design and reliable engineering."}
                    </p>

                    <div className="project-stack">
                      {(
                        project.technologies ||
                        []
                      ).map(
                        (
                          technology
                        ) => (
                          <span
                            key={
                              technology
                            }
                          >
                            {
                              technology
                            }
                          </span>
                        )
                      )}
                    </div>

                    <div className="project-actions">
                      {project.githubUrl && (
                        <a
                          href={
                            project.githubUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          GitHub
                          <ExternalArrow />
                        </a>
                      )}

                      {project.liveUrl && (
                        <a
                          href={
                            project.liveUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          Live Demo
                          <ExternalArrow />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              )
            )}
        </div>

        {!projects.length && (
          <div className="empty-panel">
            <span>
              03
            </span>

            <h3>
              Projects are coming soon.
            </h3>

            <p>
              Add published projects from
              your admin panel and they will
              appear here automatically.
            </p>
          </div>
        )}
      </section>

      {/* =========================
          JOURNEY
      ========================= */}

      <section
        id="journey"
        className="content-section"
      >
        <div className="section-label">
          <span>04</span>
          JOURNEY
        </div>

        <div className="section-heading-block">
          <div className="small-purple">
            EXPERIENCE & EDUCATION
          </div>

          <h2>
            The path so{" "}
            <span>far.</span>
          </h2>

          <p className="journey-intro">
            Every project, course and
            debugging session adds another
            layer to the journey.
          </p>
        </div>

        <div className="journey-columns">
          {/* EXPERIENCE */}

          <div className="journey-column">
            <h3>
              Experience
            </h3>

            {experiences.map(
              (item) => (
                <article
                  className="journey-card"
                  key={
                    item._id
                  }
                >
                  <div className="journey-line">
                    <span />
                  </div>

                  <small>
                    {item.startDate}{" "}
                    —{" "}
                    {item.current
                      ? "Present"
                      : item.endDate}
                  </small>

                  <h4>
                    {item.title}
                  </h4>

                  <b>
                    {item.company}
                  </b>

                  <p>
                    {item.description ||
                      "Working on practical software solutions while developing stronger engineering and problem-solving skills."}
                  </p>

                  <div className="project-stack">
                    {(
                      item.technologies ||
                      []
                    ).map(
                      (
                        technology
                      ) => (
                        <span
                          key={
                            technology
                          }
                        >
                          {
                            technology
                          }
                        </span>
                      )
                    )}
                  </div>
                </article>
              )
            )}

            {!experiences.length && (
              <div className="empty-panel compact">
                <h3>
                  More experience
                  coming soon.
                </h3>

                <p>
                  Experience added
                  from the admin panel
                  will appear here.
                </p>
              </div>
            )}
          </div>

          {/* EDUCATION */}

          <div className="journey-column">
            <h3>
              Education
            </h3>

            {educations.map(
              (item) => (
                <article
                  className="journey-card"
                  key={
                    item._id
                  }
                >
                  <div className="journey-line">
                    <span />
                  </div>

                  <small>
                    {item.startDate}{" "}
                    —{" "}
                    {item.current
                      ? "Present"
                      : item.endDate}
                  </small>

                  <h4>
                    {item.degree}
                  </h4>

                  <b>
                    {
                      item.institution
                    }
                  </b>

                  <p>
                    {item.description ||
                      "Building a strong foundation in computer science, software development and modern technology."}
                  </p>

                  <div className="project-stack">
                    {(
                      item.subjects ||
                      []
                    ).map(
                      (
                        subject
                      ) => (
                        <span
                          key={
                            subject
                          }
                        >
                          {subject}
                        </span>
                      )
                    )}
                  </div>
                </article>
              )
            )}

            {!educations.length && (
              <div className="empty-panel compact">
                <h3>
                  Education details
                  coming soon.
                </h3>

                <p>
                  Add education from
                  the admin panel to
                  build this section.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================
          CONTACT
      ========================= */}

      <section
        id="contact"
        className="content-section contact-section"
      >
        <div className="contact-orb" />

        <div className="section-label">
          <span>05</span>
          CONTACT
        </div>

        <div className="contact-layout">
          <div>
            <div className="small-purple">
              LET'S TALK
            </div>

            <h2>
              Let's build something{" "}
              <span>great.</span>
            </h2>

            <p>
              Have an idea, project or
              opportunity? Whether you're
              looking to build something new,
              improve an existing product or
              simply talk about technology,
              I'd love to hear from you.
            </p>

            <p className="contact-supporting-text">
              Tell me what you're working on,
              what problem you're trying to
              solve and where you want to go
              next. I'll get back to you as
              soon as I can.
            </p>

            {contactEmail &&
              showEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="big-email"
                >
                  {contactEmail}
                  <Arrow size={17} />
                </a>
              )}

            {profile.phone &&
              showPhone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="big-email"
                >
                  {profile.phone}
                  <Arrow size={17} />
                </a>
              )}
          </div>

          <form
            className="contact-form"
            onSubmit={
              submitContact
            }
          >
            <div className="form-row">
              <input
                required
                name="name"
                placeholder="Your name"
                value={
                  form.name
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target
                      .value,
                  })
                }
              />

              <input
                required
                type="email"
                name="email"
                placeholder="Email address"
                value={
                  form.email
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target
                      .value,
                  })
                }
              />
            </div>

            <input
              name="subject"
              placeholder="Subject"
              value={
                form.subject
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  subject:
                    e.target
                      .value,
                })
              }
            />

            <textarea
              required
              rows="6"
              name="message"
              placeholder="Tell me about your project..."
              value={
                form.message
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  message:
                    e.target
                      .value,
                })
              }
            />

            {message && (
              <div
                className={`form-message ${
                  message.includes(
                    "successfully"
                  )
                    ? "success"
                    : "error"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="button button-light send-button"
              disabled={
                sending
              }
            >
              {sending ? (
                "Sending..."
              ) : (
                <>
                  Send Message
                  <Arrow size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* =========================
          PREMIUM FOOTER
      ========================= */}

      <footer className="portfolio-footer">
        <div className="footer-top">
          {/* BRAND */}

          <div className="footer-brand">
            <a
              href="#home"
              className="footer-logo"
            >
              <span className="brand-square brand-logo-wrap">
                <img
                  src="/favicon.png"
                  alt={`${displayName} logo`}
                  className="brand-logo-image"
                />
              </span>

              <span>
                {displayName}
              </span>
            </a>

            <p>
              Building thoughtful digital
              experiences, reliable backend
              systems and useful products.
            </p>

            <div className="footer-availability">
              <span className="availability-dot" />

              <span>
                {profile.availability ||
                  "Available for opportunities"}
              </span>
            </div>
          </div>

          {/* NAVIGATION */}

          <div className="footer-column">
            <span className="footer-heading">
              EXPLORE
            </span>

            <a href="#home">
              Home
            </a>

            <a href="#about">
              About
            </a>

            <a href="#skills">
              Skills
            </a>

            <a href="#projects">
              Projects
            </a>

            <a href="#journey">
              Journey
            </a>

            <a href="#contact">
              Contact
            </a>
          </div>

          {/* CONNECT */}

          <div className="footer-column">
            <span className="footer-heading">
              CONNECT
            </span>

            {profile.github && (
              <a
                href={
                  profile.github
                }
                target="_blank"
                rel="noreferrer"
              >
                GitHub
                <ExternalArrow
                  size={13}
                />
              </a>
            )}

            {profile.linkedin && (
              <a
                href={
                  profile.linkedin
                }
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
                <ExternalArrow
                  size={13}
                />
              </a>
            )}

            {profile.website && (
              <a
                href={
                  profile.website
                }
                target="_blank"
                rel="noreferrer"
              >
                Website
                <ExternalArrow
                  size={13}
                />
              </a>
            )}

            {contactEmail &&
              showEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                >
                  Email
                  <ExternalArrow
                    size={13}
                  />
                </a>
              )}

            <a
              href={resume}
              target="_blank"
              rel="noreferrer"
            >
              Resume
              <ExternalArrow
                size={13}
              />
            </a>
          </div>

          {/* FOOTER CTA */}

          <div className="footer-cta">
            <span className="footer-heading">
              HAVE AN IDEA?
            </span>

            <h3>
              Let's make it
              real.
            </h3>

            <a
              href="#contact"
              className="footer-cta-link"
            >
              Start a conversation
              <Arrow size={15} />
            </a>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()}{" "}
            {displayName}. All
            rights reserved.
          </span>

          <span className="footer-built">
            Designed & built with
            <span className="footer-heart">
              {" "}
              ♥{" "}
            </span>
            and code.
          </span>

          <a
            href="#home"
            className="back-top"
          >
            Back to top
            <Arrow
              size={14}
            />
          </a>
        </div>
      </footer>
    </div>
  );
}

/* =========================
   HELPERS
========================= */

function showContactEmail(
  profile,
  settings
) {
  if (profile?.showEmail === false) {
    return false;
  }

  return Boolean(
    settings?.email ||
      profile?.email
  );
}

export default App;

