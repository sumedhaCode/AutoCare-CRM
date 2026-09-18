import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const UserDashboard = () => {
  const [user, setUser] = useState({});
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 🔒 Auth guard – if not logged in as USER, send to login
  useEffect(() => {
    if (!token || role !== "ROLE_USER") {
      navigate("/login");
    }
  }, [token, role, navigate]);

  // 🔄 Fetch user + bookings
  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    const fetchBookings = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/bookings/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setBookings(data || []);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchBookings();
  }, [token]);

  // ✨ 300ms fade-in once bookings are loaded
  useEffect(() => {
    if (!loading) {
      setFadeIn(true);
    }
  }, [loading]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: "40px 0",
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: "40px 32px 32px 32px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>
          <span role="img" aria-label="car">
            🚗
          </span>
        </div>
        <h1
          style={{
            fontWeight: 700,
            fontSize: 32,
            margin: 0,
            color: "#222",
          }}
        >
          Welcome back{user?.name ? `, ${user.name}` : "!"}
        </h1>
        <p
          style={{
            color: "#666",
            fontSize: 18,
            margin: "16px 0 32px 0",
          }}
        >
          Manage your car service bookings easily.
        </p>
        <div
          style={{
            background: "#f7fafd",
            borderRadius: 12,
            padding: "24px 16px",
            marginBottom: 16,
            border: "1px solid #e3e8ee",
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: 600,
              margin: "0 0 12px 0",
              color: "#2d3748",
            }}
          >
            Your Bookings
          </h2>

          {loading ? (
            // 🦴 Skeleton loader with subtle pulse
            <div className="space-y-4 animate-pulse">
              <div className="h-20 bg-white rounded shadow border border-gray-200" />
              <div className="h-20 bg-white rounded shadow border border-gray-200" />
            </div>
          ) : bookings.length === 0 ? (
            <p style={{ color: "#888", fontSize: 16 }}>
              You have no bookings yet.
            </p>
          ) : (
            <div
              className={`space-y-4 transition-opacity duration-300 ${
                fadeIn ? "opacity-100" : "opacity-0"
              }`}
            >
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 bg-white rounded shadow border border-gray-200"
                >
                  <p>
                    <strong>Service:</strong>{" "}
                    {booking.serviceName ||
                      booking.service?.type ||
                      booking.service?.name ||
                      "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={
                        booking.status === "COMPLETED"
                          ? "text-green-600 font-semibold"
                          : "text-yellow-600 font-semibold"
                      }
                    >
                      {booking.status}
                    </span>
                  </p>
                  <p>
                    <strong>Mechanic:</strong>{" "}
                    <span
                      className={
                        booking.mechanic?.name
                          ? "text-gray-800"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {booking.mechanic?.name || "Unassigned"}
                    </span>
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {booking.bookingDate
                      ? new Date(booking.bookingDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Slot:</strong> {booking.slotTime || "N/A"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Use Link instead of <a href> to avoid full page reloads */}
        <Link
          to="/booking-form"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 24,
            padding: "16px 36px",
            background: "linear-gradient(90deg, #38c6ff 0%, #4f8cff 100%)",
            color: "#fff",
            borderRadius: 32,
            fontWeight: 700,
            fontSize: 20,
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(56,198,255,0.15)",
            letterSpacing: "0.5px",
            transition: "background 0.2s, transform 0.2s",
            border: "none",
            cursor: "pointer",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background =
              "linear-gradient(90deg, #4f8cff 0%, #38c6ff 100%)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background =
              "linear-gradient(90deg, #38c6ff 0%, #4f8cff 100%)")
          }
        >
          <span style={{ fontSize: 24, marginRight: 12 }}>🛠️</span>
          Book a Service
        </Link>
      </div>
    </div>
  );
};

export default UserDashboard;
