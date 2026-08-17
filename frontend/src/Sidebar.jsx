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
} from "react-icons/fi";

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
];

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo-container">
          {!isCollapsed && (
            <h2 className="logo">Dealership</h2>
          )}

          
        </div>

        <button
          type="button"
          className="toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={
            isCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
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