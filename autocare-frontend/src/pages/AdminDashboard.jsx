import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { getAdminBookingSummary, getMe } from "../api";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [adminName, setAdminName] = useState("Admin");
  const [admin, setAdmin] = useState(null);

  // subscription guard state
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  // renewal flow (unchanged)
  const [showRenewForm, setShowRenewForm] = useState(false);
  const [duration, setDuration] = useState("SIX_MONTHS");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ================= SUBSCRIPTION GUARD ================= */
  useEffect(() => {
    getMe()
      .then(res => {
        if (res.data.subscriptionStatus === "EXPIRED") {
          setExpired(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);
  /* ===================================================== */

  useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      if (decoded?.sub) {
        setAdminName(decoded.sub.split("@")[0]);
      }
    } catch {}

    getAdminBookingSummary()
      .then(res => setSummary(res.data))
      .catch(() => {});

    getMe()
      .then(res => setAdmin(res.data))
      .catch(() => {});
  }, [token]);

  if (loading) return null;

  const submitRenewalRequest = async () => {
    const res = await fetch(
      "http://localhost:8080/api/admin/renewal-requests",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ duration }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      if (text.includes("PENDING_RENEWAL_EXISTS")) {
        alert("⚠️ You already have a pending renewal request.");
        return;
      }
      alert("❌ Wait for approval you already have a pending renewal request");
      return;
    }

    alert("✅ Renewal request submitted. Please wait for approval.");
    setShowRenewForm(false);
  };

  /* ================= EXPIRED SCREEN (UNCHANGED) ================= */
   /* ================= EXPIRED SCREEN (UPDATED WITH SUPPORT INFO) ================= */
  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border rounded-2xl p-8 max-w-lg w-full text-center shadow-sm">
          
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-3xl">
              ⛔
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-red-600 mb-3">
            Subscription Expired
          </h2>

          {/* Description */}
          <p className="text-gray-700 mb-6">
            Your garage subscription has expired, so access to the Admin Dashboard
            has been temporarily disabled.
          </p>

          {/* What you can do */}
          <div className="bg-gray-50 border rounded-lg p-4 mb-6 text-left">
            <p className="font-semibold text-gray-800 mb-2">
              What you can do next:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Contact customer support to renew your plan</li>
              <li>Request a renewal and wait for Super Admin approval</li>
            </ul>
          </div>

          {/* ✅ SUPPORT DETAILS (NEW) */}
          <div className="text-sm text-gray-600 mb-6 space-y-1">
            <p>
              📧 Email:{" "}
              <a
                href="mailto:support@autocare.com"
                className="text-blue-600 font-medium"
              >
                support@autocare.com
              </a>
            </p>
            <p>📞 Phone: +91 98765 43210</p>
            <p>🕘 Support Hours: Mon–Fri, 9:30 AM – 6:30 PM</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 items-center">
            {!showRenewForm && (
              <button
                onClick={() => setShowRenewForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Request Plan Renewal
              </button>
            )}

            {showRenewForm && (
              <div className="w-full mt-4">
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="border rounded px-3 py-2 mb-3 w-full"
                >
                  <option value="SIX_MONTHS">6 Months</option>
                  <option value="ONE_YEAR">12 Months</option>
                </select>

                <button
                  onClick={submitRenewalRequest}
                  className="w-full px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Submit Renewal Request
                </button>
              </div>
            )}

            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              className="mt-2 px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }


  /* ================= NORMAL DASHBOARD (NEW LAYOUT) ================= */
  if (!summary || !admin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-teal-50">
      <div className="max-w-7xl mx-auto p-8 space-y-8">

        {/* ADMIN GREETING */}
        <div className="bg-gradient-to-r from-blue-600 to-sky-400 text-white rounded-xl p-6 shadow">
          <h1 className="text-3xl font-bold">📊 Admin Dashboard</h1>
          <p className="mt-2 text-lg">
            Welcome, <span className="font-semibold capitalize">{adminName}</span>
          </p>
        </div>

        {/* BOOKING STATUS */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Booking Status Overview
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatusCard label="PENDING" value={summary.pending} color="yellow" />
            <StatusCard label="CONFIRMED" value={summary.confirmed} color="blue" />
            <StatusCard label="ONGOING" value={summary.ongoing} color="orange" />
            <StatusCard label="COMPLETED" value={summary.completed} color="green" />
            <StatusCard label="CANCELLED" value={summary.cancelled} color="red" />
          </div>
        </div>

        {/* SUBSCRIPTION INFO */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription</h2>

          <div className="space-y-2 text-gray-700">
            <p><strong>Plan:</strong> {admin.planName || "—"}</p>
            <p>
              <strong>Duration:</strong>{" "}
              {admin.planDuration === "SIX_MONTHS"
                ? "6 Months"
                : admin.planDuration === "ONE_YEAR"
                ? "12 Months"
                : "—"}
            </p>
            <p>
              <strong>Valid Till:</strong>{" "}
              {admin.subscriptionEndAt
                ? dayjs(admin.subscriptionEndAt).format("DD MMM YYYY")
                : "—"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ================= PRESENTATION COMPONENT ================= */
const StatusCard = ({ label, value, color }) => {
  const colors = {
    yellow: "bg-yellow-50 text-yellow-700",
    blue: "bg-blue-50 text-blue-700",
    orange: "bg-orange-50 text-orange-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className={`rounded-lg p-4 text-center border ${colors[color]}`}>
      <div className="text-3xl font-bold">{value ?? 0}</div>
      <div className="mt-1 text-sm font-medium">{label}</div>
    </div>
  );
};

export default AdminDashboard;





















