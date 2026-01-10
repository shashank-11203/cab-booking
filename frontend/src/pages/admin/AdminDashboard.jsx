import { useState } from "react";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Car,
  CalendarDays,
  XCircle,
  Building2,
  Repeat,
  TicketPercent,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { NavLink, Outlet } from "react-router-dom";

export default function AdminDashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const styles = {
    bg: {
      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
      color: isDark ? "#E5E7EB" : "#374151",
    },
    sidebar: {
      backgroundColor: isDark ? "#374151" : "#FFFFFF",
      borderRight: `1px solid ${isDark ? "#4B5563" : "#E5E7EB"}`,
    },
    heading: {
      color: isDark ? "#FFFFFF" : "#1F2937",
    },
    hoverBg: isDark ? "#4B5563" : "#F3F4F6",
    activeBg: "#FFD84C",
    activeText: "#000000",
    text: isDark ? "#E5E7EB" : "#374151",
    border: isDark ? "#4B5563" : "#D1D5DB",
  };

  const menuItems = [
    { key: "cars", label: "Cars", icon: <Car size={20} />, to: "cars" },
    { key: "rides", label: "Rides", icon: <CalendarDays size={20} />, to: "rides" },
    { key: "cancel", label: "Cancel Requests", icon: <XCircle size={20} />, to: "cancel" },
    { key: "corporate", label: "Corporate", icon: <Building2 size={20} />, to: "corporate" },
    { key: "modified", label: "Modified Rides", icon: <Repeat size={20} />, to: "modified" },
    { key: "coupons", label: "Coupons", icon: <TicketPercent size={20} />, to: "coupons" },
  ];

  return (
    <div
      style={styles.bg}
      className="flex h-screen overflow-hidden transition-all duration-300 bg-yellow-50 [[data-theme=dark]_&]:bg-gray-900"
    >
      <aside
        style={{
          ...styles.sidebar,
          width: sidebarCollapsed ? "80px" : "256px",
          transition: "width 0.3s ease",
        }}
        className="relative flex flex-col h-full shadow-lg"
      >
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            border: `1px solid ${styles.border}`,
            backgroundColor: styles.sidebar.backgroundColor,
            color: styles.text,
          }}
          className="absolute -right-4 top-6 p-2 rounded-full shadow-md transition-all duration-300"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = styles.activeBg;
            e.currentTarget.style.color = styles.activeText;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = styles.sidebar.backgroundColor;
            e.currentTarget.style.color = styles.text;
          }}
        >
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        <div className="p-6 flex-shrink-0">
          {!sidebarCollapsed ? (
            <h1
              style={{
                ...styles.heading,
                transition: "all 0.3s ease",
              }}
              className="text-2xl font-bold mb-8"
            >
              Admin Dashboard
            </h1>
          ) : (
            <div
              style={{ color: styles.heading.color }}
              className="w-full flex justify-center mt-2"
            >
              <Menu size={28} />
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-2 px-3 flex-1 overflow-y-auto pb-6">
          {menuItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}            
              end={item.key === "cars" ? false : true}
              title={sidebarCollapsed ? item.label : ""}
              className="block"
            >
              {({ isActive }) => (
                <div
                  style={{
                    backgroundColor: isActive ? styles.activeBg : "transparent",
                    color: isActive ? styles.activeText : styles.text,
                    padding: "12px 16px",
                    borderRadius: "8px",
                    textAlign: sidebarCollapsed ? "center" : "left",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: sidebarCollapsed ? "center" : "flex-start",
                    gap: sidebarCollapsed ? "0px" : "12px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = styles.hoverBg;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main
        style={styles.bg}
        className="flex-1 h-full overflow-y-auto transition-all duration-300"
      >
        <div className="p-3 bg-yellow-50 [[data-theme=dark]_&]:bg-gray-900">
          <Outlet />
        </div>
      </main>
    </div>
  );
}