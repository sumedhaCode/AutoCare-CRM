import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getMyBookings } from "../api";

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const name = localStorage.getItem("name") || "User";

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await getMyBookings();
      const data = res.data || [];

      const sorted = [...data].sort((a, b) => {
        if (!a.bookingDate || !b.bookingDate) return 0;
        return new Date(b.bookingDate) - new Date(a.bookingDate);
      });

      setBookings(sorted);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
      toast.error("Failed to load booking history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const getServiceName = (b) =>
    b.serviceType ||
    b.serviceName ||
    b.service?.type ||
    b.service?.name ||
    "N/A";

  const getVehicleModel = (b) =>
    b.vehicleModel ||
    b.vehicle?.model ||
    b.vehicle?.name ||
    "N/A";

  const getLicensePlate = (b) =>
    b.licensePlate ||
    b.vehicleNumber ||
    b.vehicle?.registrationNumber ||
    b.vehicle?.licensePlate ||
    b.vehicle?.number ||
    "";

  const getDate = (b) => {
    if (!b.bookingDate) return "N/A";
    try {
      return new Date(b.bookingDate).toLocaleDateString();
    } catch {
      return b.bookingDate;
    }
  };

  const getTime = (b) => b.slotTime || b.time || "N/A";

  // Robust remark getter: check many common field names
  const getRemarks = (b) => {
    // Common names backend might have used
    const candidates = [
      b.mechanicRemarks,
      b.mechanic_remark,
      b.mechanic_remark, // fallbacks (if snake_case sent)
      b.adminRemarks,
      b.admin_remark,
      b.remarks,
      b.remark,
      b.cancelReason,
      b.cancel_reason,
      b.cancellationReason,
      b.cancellation_reason,
      b.cancelledReason,
      b.cancelled_reason,
      b.cancellation_note,
      b.note,
    ];

    for (let i = 0; i < candidates.length; i++) {
      const v = candidates[i];
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        return String(v).trim();
      }
    }
    return "—";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 className="text-xl font-bold mb-1">Welcome, {name} 🚗</h2>
      <h3 className="text-lg font-semibold mb-4">Your Booking History</h3>

      {loading ? (
        <p>Loading your bookings…</p>
      ) : bookings.length === 0 ? (
        <p>You have no bookings yet. Book a service to see it here.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              margin: "0 auto",
              borderCollapse: "collapse",
              minWidth: "80%",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6" }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Service</th>
                <th style={thStyle}>Vehicle</th>
                <th style={thStyle}>License Plate</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Time</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, index) => (
                <tr key={b.id || index} style={rowStyle}>
                  <td style={tdStyle}>{b.id || index + 1}</td>
                  <td style={tdStyle}>{getServiceName(b)}</td>
                  <td style={tdStyle}>{getVehicleModel(b)}</td>
                  <td style={tdStyle}>{getLicensePlate(b) || "—"}</td>
                  <td style={tdStyle}>{getDate(b)}</td>
                  <td style={tdStyle}>{getTime(b)}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor:
                          b.status === "COMPLETED"
                            ? "#dcfce7"
                            : b.status === "CANCELLED"
                            ? "#fee2e2"
                            : "#fef9c3",
                        color:
                          b.status === "COMPLETED"
                            ? "#15803d"
                            : b.status === "CANCELLED"
                            ? "#b91c1c"
                            : "#854d0e",
                      }}
                    >
                      {b.status || "PENDING"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {getRemarks(b)}

                    {/* 🔴 Cancelled by Admin Label + Tooltip */}
                    {b.status === "CANCELLED" && getRemarks(b) && getRemarks(b) !== "—" && (
                      <div
                        style={{
                          marginTop: "6px",
                          color: "#b00020",
                          fontSize: "14px",
                          cursor: "pointer"
                        }}
                        title={getRemarks(b)}
                        onClick={() => alert(`Cancelled by Admin:\n\n${getRemarks(b)}`)}
                      >
                        ❌ <strong>Cancelled by Admin</strong>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: "10px 12px",
  borderBottom: "1px solid #e5e7eb",
  textAlign: "left",
  fontWeight: 600,
  fontSize: 14,
  color: "#374151",
};

const tdStyle = {
  padding: "8px 12px",
  borderBottom: "1px solid #f3f4f6",
  fontSize: 14,
  color: "#4b5563",
};

const rowStyle = {
  backgroundColor: "#ffffff",
};
