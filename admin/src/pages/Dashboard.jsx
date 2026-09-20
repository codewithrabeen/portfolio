import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Code2,
  MessageSquare,
  Eye,
  Plus,
  ArrowUpRight,
  Mail,
  ExternalLink,
  BarChart3,
  CalendarDays,
  Activity,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [messages, setMessages] = useState([]);

  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    todayViews: 0,
    weekViews: 0,
    monthViews: 0,
    dailyViews: [],
    popularPages: [],
  });

  const [loading, setLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(false);

  const [iframeKey, setIframeKey] = useState(0);

  /* =========================================================
     PORTFOLIO PREVIEW
     ========================================================= */

  const portfolioUrl = "http://localhost:5174/";

  const handleViewPortfolio = () => {
    window.open(
      portfolioUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const refreshPortfolioPreview = () => {
    setIframeKey((current) => current + 1);
  };

  /* =========================================================
     DASHBOARD DATA
     ========================================================= */

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setAnalyticsError(false);

        const results = await Promise.allSettled([
          api.get("/projects"),
          api.get("/skills/all"),
          api.get("/messages"),
          api.get("/visits/stats"),
        ]);

        const [
          projectsResult,
          skillsResult,
          messagesResult,
          visitsResult,
        ] = results;

        /* =====================================================
           PROJECTS
        ===================================================== */

        if (
          projectsResult.status ===
          "fulfilled"
        ) {
          setProjects(
            projectsResult.value.data
              ?.projects || []
          );
        } else {
          console.error(
            "Projects API error:",
            projectsResult.reason
          );

          setProjects([]);
        }

        /* =====================================================
           SKILLS
        ===================================================== */

        if (
          skillsResult.status ===
          "fulfilled"
        ) {
          setSkills(
            skillsResult.value.data
              ?.skills || []
          );
        } else {
          console.error(
            "Skills API error:",
            skillsResult.reason
          );

          setSkills([]);
        }

        /* =====================================================
           MESSAGES
        ===================================================== */

        if (
          messagesResult.status ===
          "fulfilled"
        ) {
          setMessages(
            messagesResult.value.data
              ?.messages || []
          );
        } else {
          console.error(
            "Messages API error:",
            messagesResult.reason
          );

          setMessages([]);
        }

        /* =====================================================
           VISITS / ANALYTICS
        ===================================================== */

        if (
          visitsResult.status ===
          "fulfilled"
        ) {
          const visits =
            visitsResult.value.data || {};

          console.log(
            "VISITS ANALYTICS:",
            visits
          );

          setAnalytics({
            totalViews:
              Number(
                visits.totalViews
              ) || 0,

            todayViews:
              Number(
                visits.todayViews
              ) || 0,

            weekViews:
              Number(
                visits.weekViews
              ) || 0,

            monthViews:
              Number(
                visits.monthViews
              ) || 0,

            dailyViews:
              Array.isArray(
                visits.dailyViews
              )
                ? visits.dailyViews
                : [],

            popularPages:
              Array.isArray(
                visits.popularPages
              )
                ? visits.popularPages
                : [],
          });
        } else {
          console.error(
            "Visits analytics API error:",
            visitsResult.reason
          );

          setAnalyticsError(true);
        }
      } catch (error) {
        console.error(
          "Dashboard data error:",
          error.response?.data ||
            error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /* =========================================================
     MESSAGE DATA
     ========================================================= */

  const unreadMessages = messages.filter(
    (message) => !message.read
  ).length;

  /* =========================================================
     RECENT PROJECTS
     ========================================================= */

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt || 0
          ) -
          new Date(
            a.createdAt || 0
          )
      )
      .slice(0, 4);
  }, [projects]);

  /* =========================================================
     RECENT MESSAGES
     ========================================================= */

  const recentMessages = useMemo(() => {
    return [...messages]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt || 0
          ) -
          new Date(
            a.createdAt || 0
          )
      )
      .slice(0, 5);
  }, [messages]);

  /* =========================================================
     ANALYTICS
     ========================================================= */

  const chartData = useMemo(() => {
    return getLastSevenDays(
      analytics.dailyViews
    );
  }, [analytics.dailyViews]);

  const chartTotal = useMemo(() => {
    return chartData.reduce(
      (total, item) =>
        total + item.views,
      0
    );
  }, [chartData]);

  const maxViews = Math.max(
    ...chartData.map(
      (item) => item.views
    ),
    1
  );

  const averageViews =
    chartData.length > 0
      ? Math.round(
          chartTotal /
            chartData.length
        )
      : 0;

  const peakDay = chartData.reduce(
    (best, current) =>
      current.views > best.views
        ? current
        : best,
    chartData[0] || {
      label: "—",
      views: 0,
    }
  );

  /*
   * A percentage trend is intentionally not
   * calculated here because the backend currently
   * provides only the available daily records.
   *
   * Comparing those records against a previous
   * period would produce a misleading percentage.
   */

  const highestPopularPageViews =
    useMemo(() => {
      return Math.max(
        ...analytics.popularPages.map(
          (item) =>
            Number(item.views) || 0
        ),
        1
      );
    }, [analytics.popularPages]);

  /* =========================================================
     STATS
     ========================================================= */

  const stats = [
    {
      title: "Projects",
      value: loading
        ? "—"
        : projects.length,
      icon: FolderKanban,
      path: "/projects",
      label: "Portfolio projects",
    },

    {
      title: "Skills",
      value: loading
        ? "—"
        : skills.length,
      icon: Code2,
      path: "/skills",
      label: "Technical skills",
    },

    {
      title: "Messages",
      value: loading
        ? "—"
        : messages.length,
      icon: MessageSquare,
      path: "/messages",
      label:
        unreadMessages > 0
          ? `${unreadMessages} unread`
          : "All caught up",
      badge: unreadMessages,
    },

    {
      title: "Portfolio Views",
      value: loading
        ? "—"
        : formatNumber(
            analytics.totalViews
          ),
      icon: Eye,
      path: null,
      label: `${formatNumber(
        analytics.todayViews
      )} today`,
    },
  ];

  return (
    <div className="dashboard">

      {/* =====================================================
          HERO
      ===================================================== */}

      <div className="dashboard-hero">

        <div className="dashboard-hero-copy">

          <div className="dashboard-eyebrow">
            <span className="eyebrow-dot" />
            Portfolio Control Center
          </div>

          <h1>
            Welcome back,
            <span> Rabeen.</span>
          </h1>

          <p>
            Your portfolio command center is
            ready. Monitor performance, manage
            your work and keep everything up to
            date.
          </p>

          <div className="dashboard-hero-meta">

            <div>
              <Activity size={14} />

              <span>
                System operational
              </span>
            </div>

            <div>
              <CalendarDays size={14} />

              <span>
                {new Date().toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  }
                )}
              </span>
            </div>

          </div>

        </div>

        <div className="dashboard-hero-actions">

          <button
            className="hero-secondary-button"
            onClick={
              handleViewPortfolio
            }
            type="button"
          >
            <ExternalLink size={17} />
            Live Preview
          </button>

          <button
            className="primary-button hero-primary-button"
            onClick={() =>
              navigate("/projects")
            }
            type="button"
          >
            <Plus size={18} />
            Add Project
          </button>

        </div>

        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />

      </div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="stats-grid">

        {stats.map(
          (stat, index) => {
            const Icon =
              stat.icon;

            return (
              <div
                className={`stat-card premium-stat-card ${
                  stat.path
                    ? "stat-card-clickable"
                    : ""
                }`}
                key={stat.title}
                onClick={() => {
                  if (stat.path) {
                    navigate(
                      stat.path
                    );
                  }
                }}
                style={{
                  "--stat-delay": `${index * 70}ms`,
                }}
              >

                <div className="stat-glow" />

                <div className="stat-top">

                  <div className="stat-icon">
                    <Icon size={19} />
                  </div>

                  {stat.path ? (
                    <div className="stat-arrow">
                      <ArrowUpRight
                        size={16}
                      />
                    </div>
                  ) : (
                    <div className="live-indicator">
                      <span />
                      Live
                    </div>
                  )}

                </div>

                <div className="stat-value">
                  {stat.value}
                </div>

                <div className="stat-title">
                  {stat.title}
                </div>

                <div className="stat-bottom-line">

                  <span>
                    {stat.label}
                  </span>

                  {stat.badge > 0 && (
                    <span className="stat-badge">
                      {stat.badge} unread
                    </span>
                  )}

                </div>

              </div>
            );
          }
        )}

      </div>

      {/* =====================================================
          LIVE PORTFOLIO PREVIEW
      ===================================================== */}

      <section className="dashboard-section live-preview-section">

        <div className="section-heading live-preview-heading">

          <div>

            <div className="section-kicker live-preview-kicker">
              <span className="preview-status-dot" />
              Live Website
            </div>

            <h2>
              Portfolio Preview
            </h2>

            <p>
              See your public portfolio
              exactly as visitors see it.
            </p>

          </div>

          <div className="live-preview-actions">

            <button
              className="text-button"
              onClick={
                refreshPortfolioPreview
              }
              type="button"
            >
              <RefreshCw size={15} />
              Refresh
            </button>

            <button
              className="primary-button"
              onClick={
                handleViewPortfolio
              }
              type="button"
            >
              <ExternalLink size={17} />
              Open Portfolio
            </button>

          </div>

        </div>

        <div className="live-preview-frame-wrapper">

          <div className="live-preview-browser-bar">

            <div className="preview-window-controls">
              <span />
              <span />
              <span />
            </div>

            <div className="preview-url">

              <span className="preview-lock">
                ●
              </span>

              localhost:5174

            </div>

            <div className="preview-live-badge">

              <span />
              LIVE

            </div>

          </div>

          <div className="live-preview-iframe-container">

            <iframe
              key={iframeKey}
              id="portfolio-live-preview"
              src={portfolioUrl}
              title="Live Portfolio Preview"
              loading="lazy"
            />

          </div>

        </div>

      </section>

      {/* =====================================================
          ANALYTICS
      ===================================================== */}

      <section className="analytics-section premium-analytics">

        <div className="analytics-header">

          <div>

            <div className="analytics-kicker">
              <Sparkles size={13} />
              Performance
            </div>

            <div className="analytics-title">

              <BarChart3 size={21} />

              <h2>
                Portfolio Analytics
              </h2>

            </div>

            <p>
              A real-time overview of how
              visitors are interacting with
              your portfolio.
            </p>

          </div>

          <div className="analytics-period">

            <span className="analytics-live-dot" />

            <CalendarDays size={14} />

            Last 7 days

          </div>

        </div>

        {/* ===================================================
            ANALYTICS SUMMARY
        =================================================== */}

        <div className="analytics-summary">

          <div className="analytics-summary-card">

            <div className="summary-card-top">

              <span>
                Total Views
              </span>

              <Eye size={15} />

            </div>

            <strong>
              {loading
                ? "—"
                : formatNumber(
                    analytics.totalViews
                  )}
            </strong>

            <small>
              All-time portfolio traffic
            </small>

          </div>

          <div className="analytics-summary-card">

            <div className="summary-card-top">

              <span>
                Today
              </span>

              <Activity size={15} />

            </div>

            <strong>
              {loading
                ? "—"
                : formatNumber(
                    analytics.todayViews
                  )}
            </strong>

            <small>
              Since midnight
            </small>

          </div>

          <div className="analytics-summary-card">

            <div className="summary-card-top">

              <span>
                This Week
              </span>

              <CalendarDays size={15} />

            </div>

            <strong>
              {loading
                ? "—"
                : formatNumber(
                    analytics.weekViews
                  )}
            </strong>

            <small>
              Current week
            </small>

          </div>

          <div className="analytics-summary-card">

            <div className="summary-card-top">

              <span>
                This Month
              </span>

              <BarChart3 size={15} />

            </div>

            <strong>
              {loading
                ? "—"
                : formatNumber(
                    analytics.monthViews
                  )}
            </strong>

            <small>
              Current month
            </small>

          </div>

        </div>

        {/* ===================================================
            CHART
        =================================================== */}

        <div className="analytics-chart-card premium-chart-card">

          <div className="analytics-chart-heading">

            <div>

              <div className="chart-heading-title">

                <h3>
                  Views Overview
                </h3>

                <span className="chart-live-pill">
                  <span />
                  LIVE DATA
                </span>

              </div>

              <p>
                Daily portfolio visits
                for the last seven days.
              </p>

            </div>

            <div className="chart-insight">

              <span>
                7-day total
              </span>

              <strong>
                {formatNumber(
                  chartTotal
                )}
              </strong>

              <small className="chart-period-note">
                Last 7 days
              </small>

            </div>

          </div>

          {analyticsError ? (

            <div className="analytics-error-state">

              <div>
                <BarChart3 size={28} />
              </div>

              <strong>
                Analytics unavailable
              </strong>

              <p>
                The visits endpoint
                could not be loaded.
                Check your backend route{" "}
                <code>
                  /api/visits/stats
                </code>
                .
              </p>

            </div>

          ) : (

            <div className="views-chart">

              <div className="chart-grid-lines">

                <span />
                <span />
                <span />
                <span />
                <span />

              </div>

              <div className="chart-y-axis">

                <span>
                  {formatChartNumber(
                    maxViews
                  )}
                </span>

                <span>
                  {formatChartNumber(
                    Math.round(
                      maxViews * 0.75
                    )
                  )}
                </span>

                <span>
                  {formatChartNumber(
                    Math.round(
                      maxViews * 0.5
                    )
                  )}
                </span>

                <span>
                  {formatChartNumber(
                    Math.round(
                      maxViews * 0.25
                    )
                  )}
                </span>

                <span>
                  0
                </span>

              </div>

              <div className="chart-columns">

                {chartData.map(
                  (item, index) => {

                    const percentage =
                      maxViews > 0
                        ? (item.views /
                            maxViews) *
                          100
                        : 0;

                    const height =
                      item.views === 0
                        ? 5
                        : Math.max(
                            percentage,
                            9
                          );

                    const isPeak =
                      item.views ===
                        peakDay.views &&
                      item.views > 0;

                    const isToday =
                      index ===
                      chartData.length - 1;

                    return (
                      <div
                        className={`chart-column ${
                          isPeak
                            ? "chart-column-peak"
                            : ""
                        } ${
                          isToday
                            ? "chart-column-today"
                            : ""
                        }`}
                        key={
                          item.date
                        }
                      >

                        <div className="chart-tooltip">

                          <strong>
                            {formatNumber(
                              item.views
                            )}
                          </strong>

                          <span>
                            views
                          </span>

                        </div>

                        <div className="chart-value">

                          {formatNumber(
                            item.views
                          )}

                        </div>

                        <div className="chart-bar-wrapper">

                          <div
                            className="chart-bar"
                            style={{
                              height: `${height}%`,
                              animationDelay: `${index * 80}ms`,
                            }}
                          >

                            <div className="chart-bar-shine" />

                            <div className="chart-bar-glow" />

                          </div>

                        </div>

                        <span className="chart-day">

                          {item.label}

                        </span>

                        <small>

                          {isToday
                            ? "Today"
                            : formatShortDate(
                                item.date
                              )}

                        </small>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          )}

          {/* =================================================
              CHART FOOTER
          ================================================= */}

          <div className="chart-footer">

            <div className="chart-footer-item">

              <span className="chart-footer-dot" />

              <span>

                Average{" "}

                <strong>
                  {formatNumber(
                    averageViews
                  )}
                </strong>{" "}

                views/day

              </span>

            </div>

            <div className="chart-footer-item">

              <span className="chart-footer-dot peak" />

              <span>

                Peak{" "}

                <strong>
                  {formatNumber(
                    peakDay.views
                  )}
                </strong>{" "}

                on {peakDay.label}

              </span>

            </div>

          </div>

        </div>

        {/* ===================================================
            POPULAR PAGES
        =================================================== */}

        <div className="popular-pages premium-popular-pages">

          <div className="popular-pages-heading">

            <div>

              <div className="analytics-kicker">

                <Eye size={12} />

                Traffic breakdown

              </div>

              <h3>
                Popular Pages
              </h3>

              <p>
                The sections visitors are
                viewing most.
              </p>

            </div>

          </div>

          {analytics.popularPages
            .length === 0 ? (

            <div className="analytics-empty">

              <div className="empty-analytics-icon">

                <Eye size={25} />

              </div>

              <strong>
                No page analytics yet
              </strong>

              <p>
                Once visitors start
                browsing your portfolio,
                their favorite pages
                will appear here.
              </p>

            </div>

          ) : (

            <div className="popular-pages-list">

              {analytics.popularPages.map(
                (page, index) => {

                  const pageViews =
                    Number(
                      page.views
                    ) || 0;

                  return (
                    <div
                      className="popular-page"
                      key={
                        page._id ||
                        page.path ||
                        index
                      }
                    >

                      <div
                        className={`popular-page-rank ${
                          index === 0
                            ? "rank-first"
                            : ""
                        }`}
                      >

                        {String(
                          index + 1
                        ).padStart(2, "0")}

                      </div>

                      <div className="popular-page-info">

                        <div className="popular-page-title-row">

                          <strong>
                            {page._id ||
                              page.path ||
                              "/"}
                          </strong>

                          <span>

                            {formatNumber(
                              pageViews
                            )}{" "}

                            {pageViews === 1
                              ? "view"
                              : "views"}

                          </span>

                        </div>

                        <div className="popular-page-progress">

                          <div
                            style={{
                              width: `${
                                (pageViews /
                                  highestPopularPageViews) *
                                100
                              }%`,
                            }}
                          />

                        </div>

                      </div>

                      <ChevronRight
                        size={15}
                      />

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          PROJECTS + MESSAGES
      ===================================================== */}

      <div className="dashboard-content-grid">

        {/* ===================================================
            PROJECTS
        =================================================== */}

        <div className="dashboard-section dashboard-projects">

          <div className="section-heading">

            <div>

              <div className="section-kicker">
                Workspace
              </div>

              <h2>
                Recent Projects
              </h2>

              <p>
                Your latest portfolio projects
              </p>

            </div>

            <button
              className="text-button"
              onClick={() =>
                navigate("/projects")
              }
              type="button"
            >

              View all

              <ArrowUpRight size={16} />

            </button>

          </div>

          {recentProjects.length ===
          0 ? (

            <div className="empty-state">

              <FolderKanban size={40} />

              <h3>
                No projects yet
              </h3>

              <p>
                Add your first project
                to start building your
                portfolio.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  navigate("/projects")
                }
                type="button"
              >

                <Plus size={18} />

                Create Project

              </button>

            </div>

          ) : (

            <div className="dashboard-project-list">

              {recentProjects.map(
                (project, index) => (

                  <div
                    className="dashboard-project-card"
                    key={project._id}
                    style={{
                      "--item-delay": `${index * 50}ms`,
                    }}
                  >

                    <div className="dashboard-project-image">

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
                        <FolderKanban
                          size={24}
                        />
                      )}

                    </div>

                    <div className="dashboard-project-info">

                      <h3>
                        {project.title}
                      </h3>

                      <p>

                        {project.description?.slice(
                          0,
                          90
                        )}

                        {project.description
                          ?.length > 90
                          ? "..."
                          : ""}

                      </p>

                      <div className="dashboard-project-meta">

                        <span
                          className={`status-badge ${
                            project.published
                              ? "published"
                              : "draft"
                          }`}
                        >

                          <span />

                          {project.published
                            ? "Published"
                            : "Draft"}

                        </span>

                        {project.featured && (
                          <span className="status-badge featured">
                            Featured
                          </span>
                        )}

                      </div>

                    </div>

                    <button
                      className="icon-button project-open-button"
                      title="Open projects"
                      onClick={() =>
                        navigate(
                          "/projects"
                        )
                      }
                      type="button"
                    >

                      <ExternalLink
                        size={17}
                      />

                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* ===================================================
            MESSAGES
        =================================================== */}

        <div className="dashboard-section dashboard-messages">

          <div className="section-heading">

            <div>

              <div className="section-kicker">
                Inbox
              </div>

              <h2>
                Recent Messages
              </h2>

              <p>
                Latest messages from
                your portfolio
              </p>

            </div>

            <button
              className="text-button"
              onClick={() =>
                navigate("/messages")
              }
              type="button"
            >

              View all

              <ArrowUpRight size={16} />

            </button>

          </div>

          {recentMessages.length ===
          0 ? (

            <div className="empty-state compact">

              <Mail size={36} />

              <h3>
                No messages yet
              </h3>

              <p>
                Messages sent through
                your portfolio will
                appear here.
              </p>

            </div>

          ) : (

            <div className="dashboard-message-list">

              {recentMessages.map(
                (message, index) => (

                  <div
                    className={`dashboard-message ${
                      !message.read
                        ? "dashboard-message-unread"
                        : ""
                    }`}
                    key={message._id}
                    style={{
                      "--item-delay": `${index * 45}ms`,
                    }}
                    onClick={() =>
                      navigate(
                        "/messages"
                      )
                    }
                  >

                    <div className="dashboard-message-avatar">

                      {message.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "?"}

                    </div>

                    <div className="dashboard-message-info">

                      <div className="dashboard-message-top">

                        <h3>
                          {message.name}
                        </h3>

                        {!message.read && (
                          <span className="unread-dot" />
                        )}

                      </div>

                      <p>
                        {message.subject ||
                          "No subject"}
                      </p>

                      <span className="dashboard-message-date">

                        {formatMessageDate(
                          message.createdAt
                        )}

                      </span>

                    </div>

                    <ChevronRight
                      className="message-arrow"
                      size={15}
                    />

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <div className="dashboard-section quick-actions-dashboard">

        <div className="section-heading">

          <div>

            <div className="section-kicker">
              Shortcuts
            </div>

            <h2>
              Quick Actions
            </h2>

            <p>
              Jump directly to common
              portfolio management tasks.
            </p>

          </div>

        </div>

        <div className="quick-actions">

          <QuickAction
            icon={
              <FolderKanban size={20} />
            }
            title="Manage Projects"
            description="Add or update portfolio projects"
            onClick={() =>
              navigate("/projects")
            }
          />

          <QuickAction
            icon={
              <Code2 size={20} />
            }
            title="Manage Skills"
            description="Update your technical skills"
            onClick={() =>
              navigate("/skills")
            }
          />

          <QuickAction
            icon={
              <MessageSquare size={20} />
            }
            title="Check Messages"
            description={
              unreadMessages > 0
                ? `${unreadMessages} unread message${
                    unreadMessages >
                    1
                      ? "s"
                      : ""
                  }`
                : "You're all caught up"
            }
            onClick={() =>
              navigate("/messages")
            }
          />

          <QuickAction
            icon={
              <ExternalLink size={20} />
            }
            title="View Portfolio"
            description="Open your public portfolio"
            onClick={
              handleViewPortfolio
            }
          />

          <QuickAction
            icon={
              <Eye size={20} />
            }
            title="Update Profile"
            description="Manage your public profile"
            onClick={() =>
              navigate("/profile")
            }
          />

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   QUICK ACTION
   ========================================================= */

function QuickAction({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      className="quick-action"
      onClick={onClick}
      type="button"
    >

      <div className="quick-action-icon">
        {icon}
      </div>

      <div>

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>

      <ArrowUpRight size={17} />

    </button>
  );
}

/* =========================================================
   ANALYTICS HELPERS
   ========================================================= */

function getLastSevenDays(
  dailyViews = []
) {
  const result = [];

  const normalized = new Map();

  dailyViews.forEach((item) => {
    if (!item) return;

    const rawDate =
      item.date ||
      item._id ||
      item.day ||
      item.createdAt;

    if (!rawDate) return;

    const dateKey =
      normalizeDateKey(rawDate);

    if (!dateKey) return;

    const views = Number(
      item.views ??
        item.count ??
        item.total ??
        item.value ??
        0
    );

    normalized.set(
      dateKey,
      (normalized.get(dateKey) ||
        0) +
        (Number.isFinite(views)
          ? views
          : 0)
    );
  });

  for (
    let i = 6;
    i >= 0;
    i--
  ) {
    const date = new Date();

    date.setHours(
      0,
      0,
      0,
      0
    );

    date.setDate(
      date.getDate() - i
    );

    const dateString = [
      date.getFullYear(),
      String(
        date.getMonth() + 1
      ).padStart(2, "0"),
      String(
        date.getDate()
      ).padStart(2, "0"),
    ].join("-");

    result.push({
      date: dateString,

      views:
        normalized.get(
          dateString
        ) || 0,

      label:
        date.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
          }
        ),
    });
  }

  return result;
}

function normalizeDateKey(
  value
) {
  if (!value) return null;

  if (
    typeof value ===
      "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return value;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, "0"),
    String(
      date.getDate()
    ).padStart(2, "0"),
  ].join("-");
}

function formatNumber(
  value
) {
  const number =
    Number(value) || 0;

  return new Intl.NumberFormat(
    "en-US"
  ).format(number);
}

function formatChartNumber(
  value
) {
  const number =
    Number(value) || 0;

  if (
    number >= 1000000
  ) {
    return `${(
      number / 1000000
    ).toFixed(1)}M`;
  }

  if (
    number >= 1000
  ) {
    return `${(
      number / 1000
    ).toFixed(1)}K`;
  }

  return formatNumber(
    number
  );
}

function formatShortDate(
  dateString
) {
  const date =
    new Date(
      `${dateString}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
}

function formatMessageDate(
  date
) {
  if (!date) return "";

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "";
  }

  return parsed.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

export default Dashboard;