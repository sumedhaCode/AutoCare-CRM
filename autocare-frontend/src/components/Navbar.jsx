import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar({ token, role }) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const baseLinkStyle = {
    margin: "0 8px",
    padding: "8px 14px",
    borderRadius: 9999,
    textDecoration: "none",
    fontSize: 14,
    transition: "background-color 0.15s ease, color 0.15s ease",
  };

  const linkStyle = ({ isActive }) => ({
    ...baseLinkStyle,
    fontWeight: isActive ? 700 : 500,
    color: isActive ? "#1d4ed8" : "#374151",
    backgroundColor: isActive ? "#e0f2fe" : "transparent",
    borderBottom: isActive ? "2px solid #1d4ed8" : "2px solid transparent",
  });

  const navStyle = {
    background: "#f9fafb",
    padding: "10px 20px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "4px",
    position: "sticky",
    top: 0,
    zIndex: 40,
  };

  const logoutButtonStyle = {
    ...baseLinkStyle,
    fontWeight: 600,
    color: "#b91c1c",
    backgroundColor: "#fee2e2",
    border: "none",
    cursor: "pointer",
  };

  return (
    <nav style={navStyle}>
     {/* NOT LOGGED IN */}
{!token && (
  <>
    <NavLink to="/login" style={linkStyle}>
      Login
    </NavLink>
    <NavLink to="/register" style={linkStyle}>
      Register
    </NavLink>
  </>
)}

      {/* ADMIN */}
      {token && role === "ROLE_ADMIN" && (
        <>
          <NavLink to="/admin/dashboard" style={linkStyle}>
            Admin Home
          </NavLink>
          <NavLink to="/admin/view-bookings" style={linkStyle}>
            View Bookings
          </NavLink>
          <NavLink to="/admin/book-service" style={linkStyle}>
            Book Service
          </NavLink>
          <NavLink to="/admin/mechanic-load" style={linkStyle}>
            Mechanic Load
          </NavLink>
          <NavLink to="/admin/add-mechanic" style={linkStyle}>
            Add Mechanic
          </NavLink>
          <NavLink to="/admin/reports" style={linkStyle}>
            Service & Reports
          </NavLink>
          <button onClick={handleLogout} style={logoutButtonStyle}>
            Logout
          </button>
        </>
      )}

      {/* USER */}
      {token && role === "ROLE_USER" && (
        <>
          <NavLink to="/user/dashboard" style={linkStyle}>
            Home
          </NavLink>
          <NavLink to="/booking-form" style={linkStyle}>
            Book Service
          </NavLink>
          <NavLink to="/booking-history" style={linkStyle}>
            View Bookings
          </NavLink>
          <button onClick={handleLogout} style={logoutButtonStyle}>
            Logout
          </button>
        </>
      )}

      {/* MECHANIC / STAFF */}
      {token && role === "ROLE_MECHANIC" && (
        <>
          <NavLink to="/staff/dashboard" style={linkStyle}>
            My Tasks
          </NavLink>
          <button onClick={handleLogout} style={logoutButtonStyle}>
            Logout
          </button>
        </>
      )}

      {/* SUPER ADMIN */}
      {token && role === "ROLE_SUPER_ADMIN" && (
        <>
          <NavLink to="/superadmin" style={linkStyle}>
            Super Admin Home
          </NavLink>
          <NavLink to="/superadmin/admins" style={linkStyle}>
            Admin Management
          </NavLink>
          <NavLink to="/superadmin/subscriptions" style={linkStyle}>
            Subscription & Billing
          </NavLink>
          <NavLink to="/superadmin/analytics" style={linkStyle}>
            Analytics
          </NavLink>
          <NavLink to="/superadmin/notifications" style={linkStyle}>
            Notifications
          </NavLink>
          <button onClick={handleLogout} style={logoutButtonStyle}>
            Logout
          </button>
        </>
      )}
    </nav>
  );
}
