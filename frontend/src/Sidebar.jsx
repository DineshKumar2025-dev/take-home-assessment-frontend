import "./Sidebar.css";
import { NavLink } from "react-router-dom";

const menuItems = [
  { id: 1, label: "Overview", icon: "📊", href: "/" },
  { id: 2, label: "Branches", icon: "📈", href: "/branches" },
  { id: 3, label: "Sales Reps", icon: "👥", href: "/sales-reps" },
  {id:4,label:"Forecast",icon:"⏱️",href:"/sales-forecast"},
  {id:5,label:"Leader Board",icon:"⏱️",href:"/leader-board"},
  {id:6,label:"Deliveries",icon:"⏱️",href:"/deliveries"},
];

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  return (
    // BUG FIX: this className never included "collapsed" before, so the
    // sidebar could never actually shrink no matter what state said.
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          {!isCollapsed && <h2 className="logo">Dealership</h2>}
          <span className="logo-dot"></span>
        </div>

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

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.href}
            end={item.href === "/"}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              `nav-link-item ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>


    </aside>
  );
}