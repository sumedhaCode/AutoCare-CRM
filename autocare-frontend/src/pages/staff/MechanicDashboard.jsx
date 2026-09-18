// src/pages/staff/MechanicDashboard.jsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


/**
 * Mechanic Dashboard — frontend-only name handling
 * - Preferred: localStorage.user.name (saved at login)
 * - Fallback: decode JWT token and use decoded.name / decoded.fullName / decoded.sub
 * - Keeps all existing task logic unchanged
 */

const MechanicDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const defaultIllustration = "/images/mechanic-illustration.jpg";

  // Read normalized user from localStorage
  const getUserFromStorage = () => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") return parsed;
        } catch (e) {
          // fall through
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  // Decode JWT to attempt to get a name fallback
  const getNameFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const decoded = jwtDecode(token);
      return (
        decoded?.name ||
        decoded?.fullName ||
        (decoded?.given_name && decoded?.family_name
          ? `${decoded.given_name} ${decoded.family_name}`
          : null) ||
        decoded?.sub ||
        decoded?.email ||
        null
      );
    } catch (e) {
      return null;
    }
  };

  const user = getUserFromStorage();
  const mechanicName =
    (user && (user.name || user.fullName || user.email)) ||
    getNameFromToken() ||
    "Mechanic";

  const initialAvatar =
    (user && (user.avatarUrl || user.photoUrl || user.avatar)) ||
    defaultIllustration;

  const [avatarSrc, setAvatarSrc] = useState(initialAvatar);

  useEffect(() => {
    // if localStorage.user changes, sync avatar/name
    const onStorage = () => {
      const updatedRaw = localStorage.getItem("user");
      if (updatedRaw) {
        try {
          const updated = JSON.parse(updatedRaw);
          const candidate =
            (updated && (updated.avatarUrl || updated.photoUrl || updated.avatar)) ||
            defaultIllustration;
          setAvatarSrc(candidate);
        } catch (e) {
          setAvatarSrc(defaultIllustration);
        }
      } else {
        const candidate = defaultIllustration;
        setAvatarSrc(candidate);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Fetch tasks (existing logic unchanged)
  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:8080/api/staff/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load tasks");
      const data = await res.json();

      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("❌ Task fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(); // initial
    const interval = setInterval(fetchTasks, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Update status and remarks (unchanged)
  const updateStatus = async (id, nextStatus) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:8080/api/staff/tasks/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      if (!res.ok) throw new Error("Status update failed");
      const updated = await res.json();

      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success(`Task marked as ${nextStatus}`);
    } catch (e) {
      console.error("❌ Status update error:", e);
      toast.error("Could not update status");
    }
  };

  const updateRemarks = async (id, text) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:8080/api/staff/tasks/${id}/remarks`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ serviceDetails: text }),
        }
      );

      if (!res.ok) throw new Error("Remarks update failed");
      const updated = await res.json();

      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success("Remarks saved");
    } catch (e) {
      console.error("❌ Remarks update error:", e);
      toast.error("Could not save remarks");
    }
  };

  if (loading) return <div className="p-6">Loading tasks...</div>;

  const pending = tasks.filter((t) => t.status === "PENDING").length;
  const ongoing = tasks.filter((t) => t.status === "ONGOING").length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;

  const getVehicleModel = (t) => t.vehicleModel || "Unknown";

  return (
    <div className="p-6">
      {/* Header / Profile Banner */}
      <div className="mb-6">
        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl shadow"
          role="banner"
        >
          {/* Left: Avatar + Greeting */}
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shadow-sm"
              aria-hidden="false"
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={`${mechanicName} avatar`}
                  onError={() => setAvatarSrc(defaultIllustration)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="bg-gradient-to-br from-sky-600 to-indigo-500 text-white font-bold text-lg inline-flex items-center justify-center w-full h-full">
                  {(() => {
                    const initials = (mechanicName || "M")
                      .split(/\s+/)
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();
                    return initials;
                  })()}
                </span>
              )}
            </div>

            <div>
              <div
                className="text-2xl md:text-3xl font-semibold leading-tight"
                style={{ color: "#0f172a" }}
              >
                Welcome, {mechanicName}!
              </div>
              <div className="text-sm uppercase tracking-wide text-gray-600 mt-1">
                User &nbsp;•&nbsp; Mechanic
              </div>
            </div>
          </div>

          {/* Right: Status pills + Logout */}
          <div className="flex items-center gap-3 flex-wrap md:ml-4">
            <StatusPill
              label="Pending"
              value={pending}
              tone="yellow"
              icon="⏳"
              ariaLabel={`Pending tasks: ${pending}`}
            />
            <StatusPill
              label="Ongoing"
              value={ongoing}
              tone="blue"
              icon="🚗"
              ariaLabel={`Ongoing tasks: ${ongoing}`}
            />
            <StatusPill
              label="Completed"
              value={completed}
              tone="green"
              icon="✅"
              ariaLabel={`Completed tasks: ${completed}`}
            />
            <button
              onClick={handleLogout}
              className="ml-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        
      </div>

      {/* Table (functionality unchanged) */}
      <table className="min-w-full bg-white rounded-xl shadow">
        <thead>
          <tr className="text-left border-b">
            <th className="p-3">Service</th>
            <th className="p-3">Vehicle Model</th>
            <th className="p-3">Vehicle Number</th>
            <th className="p-3">Status</th>
            <th className="p-3">Remarks</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id} className="border-b">
              <td className="p-3">{t.title}</td>
              <td className="p-3">{getVehicleModel(t)}</td>
              <td className="p-3">{t.vehicleNumber}</td>
              <td className="p-3">{t.status}</td>
              <td className="p-3 text-sm text-gray-600">
                {t.serviceDetails || (
                  <span className="italic text-gray-400">No remarks</span>
                )}
              </td>
              <td className="p-3 flex gap-2 flex-wrap">
                {t.status === "PENDING" && (
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    onClick={() => updateStatus(t.id, "ONGOING")}
                  >
                    Start
                  </button>
                )}

                {t.status === "ONGOING" && (
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded"
                    onClick={() => updateStatus(t.id, "COMPLETED")}
                  >
                    Complete
                  </button>
                )}

                <button
                  className="px-3 py-1 bg-gray-200 rounded"
                  onClick={() => {
                    const text = prompt("Add remarks:", t.serviceDetails || "");
                    if (text !== null && text.trim() !== "") {
                      updateRemarks(t.id, text.trim());
                    }
                  }}
                >
                  Add remarks
                </button>
              </td>
            </tr>
          ))}

          {tasks.length === 0 && (
            <tr>
              <td className="p-3 text-gray-500" colSpan="6">
                No tasks assigned yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

/* Status pill component (top-right) */
const StatusPill = ({ label, value, tone = "gray", icon, ariaLabel }) => {
  const toneMap = {
    yellow: {
      bg: "bg-[#fff6db]",
      text: "text-[#7a5a07]",
      border: "border-[#f0e1a8]",
    },
    blue: {
      bg: "bg-[#eaf5ff]",
      text: "text-[#1e3a8a]",
      border: "border-[#cfe9ff]",
    },
    green: {
      bg: "bg-[#e9fbef]",
      text: "text-[#166534]",
      border: "border-[#cfeede]",
    },
    gray: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-100",
    },
  };

  const style = toneMap[tone] || toneMap.gray;

  return (
    <div
      role="status"
      aria-label={ariaLabel || `${label}: ${value}`}
      className={`inline-flex items-center gap-3 px-4 py-2 rounded-full shadow-sm border ${style.bg} ${style.text} ${style.border}`}
      style={{ minWidth: 140 }}
    >
      <div className="text-lg" aria-hidden="true">
        {icon}
      </div>
      <div className="flex flex-col leading-none">
        <div className="text-xs text-gray-600">{label}</div>
        <div className="font-semibold text-lg" style={{ lineHeight: 1 }}>
          {value}
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;
