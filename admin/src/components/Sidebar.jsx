import {
  LayoutDashboard,
  FolderKanban,
  Code2,
  BriefcaseBusiness,
  GraduationCap,
  MessageSquare,
  UserRound,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import api from "../services/api";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const links = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Projects",
      path: "/projects",
      icon: FolderKanban,
    },
    {
      name: "Skills",
      path: "/skills",
      icon: Code2,
    },
    {
      name: "Experience",
      path: "/experience",
      icon: BriefcaseBusiness,
    },
    {
      name: "Education",
      path: "/education",
      icon: GraduationCap,
    },
    {
      name: "Messages",
      path: "/messages",
      icon: MessageSquare,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: UserRound,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">R</div>

        <div>
          <strong>Rabeen</strong>
          <span>Admin Panel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-label">MAIN</p>

        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{link.name}</span>
            </NavLink>
          );
        })}

        <p className="nav-label settings-label">
          SYSTEM
        </p>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <button
        className="logout-button"
        onClick={handleLogout}
      >
        <LogOut size={19} />
        <span>Logout</span>
      </button>
    </aside>
  );
}

export default Sidebar;