import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import {
  FiBarChart2,
  FiGitBranch,
  FiUsers,
  FiTrendingUp,
  FiAward,
  FiTruck,
  FiClock,
  FiCompass,
  FiZap
} from "react-icons/fi";
import { useEffect } from "react";
import { Tooltip } from "bootstrap";

const menuItems = [
  {
    id: 1,
    label: "Overview",
    icon: FiBarChart2,
    href: "/",
  },
  {
    id: 2,
    label: "Branches",
    icon: FiGitBranch,
    href: "/branches",
  },
  {
    id: 3,
    label: "Sales Reps",
    icon: FiUsers,
    href: "/sales-reps",
  },
  {
    id: 4,
    label: "Forecast",
    icon: FiTrendingUp,
    href: "/sales-forecast",
  },
  {
    id: 5,
    label: "Leaderboard",
    icon: FiAward,
    href: "/leader-board",
  },
  {
    id: 6,
    label: "Deliveries",
    icon: FiTruck,
    href: "/deliveries",
  },
  {
    id: 7,
    label: "Lead Aging",
    icon: FiClock,
    href: "/lead-aging",
  },
  { 
    id: 8, 
    label: "What If Simulator", 
    icon: FiZap, 
    href: "/what-if" 
  },
  { 
    id: 9, 
    label: "Anomalies", 
    icon: FiCompass, 
    href: "/anomaly-detection" 
  },
];

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
}) {

  // Initialize Bootstrap tooltips
  useEffect(() => {
    const tooltipElements = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );

    const tooltips = [...tooltipElements].map(
      (element) => new Tooltip(element)
    );

    return () => {
      tooltips.forEach((tooltip) => tooltip.dispose());
    };
  }, [isCollapsed]);

  return (
    <aside
      className={`sidebar ${
        isCollapsed ? "collapsed" : ""
      }`}
    >

      {/* Header */}
        <div className="sidebar-header">
          <div className="logo-container">
            <h2 className="logo">
              Dealership
            </h2>
          </div>

          {/* Hide toggle on mobile using CSS */}
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? "→" : "←"}
          </button>
        </div>

      {/* Navigation */}
  <nav className="sidebar-nav">
  {menuItems.map((item) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.id}
        to={item.href}
        end={item.href === "/"}
        data-bs-toggle={isCollapsed ? "tooltip" : undefined}
        data-bs-placement="bottom"
        title={isCollapsed ? item.label : undefined}
        className={({ isActive }) =>
          `nav-link-item ${isActive ? "active" : ""}`
        }
      >
        <span className="nav-icon">
          <Icon size={20} strokeWidth={2} />
        </span>

        {!isCollapsed && (
          <span className="nav-label">
            {item.label}
          </span>
        )}
      </NavLink>
    );
  })}
</nav>

    </aside>
  );
}