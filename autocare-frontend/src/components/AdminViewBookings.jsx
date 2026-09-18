// src/pages/AdminViewBookings.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { updateBookingCharges } from "../api";

const AdminViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [selectedMechanics, setSelectedMechanics] = useState({});
  const [cancellingIds, setCancellingIds] = useState({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null);

  // Local toast state for instant feedback (auto-hide)
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

const [editedCharges, setEditedCharges] = useState({});
const [savingChargeId, setSavingChargeId] = useState(null);
const [editingChargeId, setEditingChargeId] = useState(null);


  // ------------------------------------------------------------------
  // Load bookings + mechanics
  // ------------------------------------------------------------------
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No token found. Please log in.");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [bookingsRes, mechRes] = await Promise.all([
        axios.get("http://localhost:8080/api/admin/bookings", { headers }),
        axios.get("http://localhost:8080/api/mechanics", { headers }),
      ]);

      const list = Array.isArray(bookingsRes.data)
        ? bookingsRes.data
        : bookingsRes.data?.content || [];

      setBookings(list);
      setMechanics(Array.isArray(mechRes.data) ? mechRes.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bookings or mechanics.");
      setBookings([]);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // ------------------------------------------------------------------
  // Status color helper (UI ONLY)
  // ------------------------------------------------------------------
  const getStatusClass = (status) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600 font-semibold";
      case "CANCELLED":
        return "text-red-600 font-semibold";
      case "ONGOING":
        return "text-blue-600 font-semibold";
      case "CONFIRMED":
        return "text-indigo-600 font-semibold";
      case "PENDING":
        return "text-gray-500 font-medium";
      default:
        return "text-gray-400 font-medium";
    }
  };

  // ------------------------------------------------------------------
  // Assign / Update mechanic
  // ------------------------------------------------------------------
  const handleSelectMechanic = (bookingId, mechanicId) => {
    setSelectedMechanics((prev) => ({
      ...prev,
      [bookingId]: mechanicId,
    }));
  };

  const handleAssign = async (bookingId) => {
    const mechanicId = selectedMechanics[bookingId];
    if (!mechanicId) {
      toast.error("Please select a mechanic first.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    const isUpdate = Boolean(
      bookings.find((b) => b.id === bookingId)?.mechanic
    );

    try {
      await axios.put(
        `http://localhost:8080/api/admin/bookings/${bookingId}/assign-mechanic`,
        { mechanicId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(
        isUpdate
          ? "Mechanic updated successfully"
          : "Mechanic assigned successfully"
      );

      fetchData();
    } catch {
      toast.error("Failed to assign mechanic");
    }
  };

  // ------------------------------------------------------------------
  // Cancel booking (requires admin remark)
  // ------------------------------------------------------------------
  const openCancelModal = (booking) => {
    setSelectedBookingToCancel(booking);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim() || !selectedBookingToCancel) return;

    const bookingId = selectedBookingToCancel.id;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setCancellingIds((s) => ({ ...s, [bookingId]: true }));

      await axios.put(
        `http://localhost:8080/api/admin/bookings/${bookingId}/cancel`,
        { reason: cancelReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Real-time success notification
      setToastMessage("Booking cancelled successfully");
      setShowToast(true);

      // ✅ Auto close after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);

      // ✅ Update UI immediately
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: "CANCELLED", cancelReason }
            : b
        )
      );

      setShowCancelModal(false);
      setSelectedBookingToCancel(null);
      setCancelReason("");
    } catch (error) {
      toast.error("Failed to cancel booking");
    } finally {
      setCancellingIds((s) => {
        const copy = { ...s };
        delete copy[bookingId];
        return copy;
      });
    }
  };

  // ------------------------------------------------------------------
  // Update booking charges (COMPLETED only)
  // ------------------------------------------------------------------
  const handleChargesUpdate = async (bookingId, charges) => {
    if (charges === "" || charges == null) return;
    if (charges < 0) {
      toast.error("Charges cannot be negative");
      return;
    }

    try {
      await updateBookingCharges(bookingId, charges);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, charges } : b))
      );

      // 🔔 Notify Service & Reports page
   //Newwwwwwwwwwwwwwwwwwwwwwwww
   // 🔔 REAL-TIME SYNC FIX (same tab + other tabs)
      const timestamp = Date.now();
      localStorage.setItem("lastChargesUpdate", timestamp);
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "lastChargesUpdate",
          newValue: timestamp,
        })
      );
    } catch {
      toast.error("Failed to update charges");
    }
  };

  const formatDateTime = (d) => (d ? d.replace("T", " ") : "-");

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">All Bookings</h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Vehicle</th>
              <th className="p-2 text-left">Model</th>
              <th className="p-2 text-left">Customer</th>
              <th className="p-2 text-left">Service</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Mechanic</th>
              <th className="p-2 text-left">Actions</th>
              <th className="p-2 text-left">Charges</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b) => {
              const status = b.status || "PENDING";
              const canAssign =
                status === "PENDING" || status === "CONFIRMED";

              const isUpdate = Boolean(b.mechanic);
              const remarks =
                b.remarks ||
                b.mechanicRemarks ||
                b.mechanic?.remarks;

              return (
                <tr key={b.id}>
                  <td className="p-2">{formatDateTime(b.bookingDate)}</td>

                  <td className="p-2">
                    {b.vehicle?.licensePlate ||
                      b.vehicleNumber ||
                      b.vehicle_number ||
                      "-"}
                  </td>

                  <td className="p-2">
                    {b.vehicle?.model ||
                      b.vehicleModel ||
                      b.vehicle_model ||
                      "-"}
                  </td>

                  <td className="p-2">{b.customerName || "Customer"}</td>

                  <td className="p-2">
                    {b.service?.name ||
                      b.serviceName ||
                      b.service_name ||
                      "-"}
                  </td>

                  <td className="p-2">
                    <div className={getStatusClass(status)}>
                      {status}
                    </div>
                    {status === "COMPLETED" && remarks && (
                      <div className="mt-1 text-xs text-gray-600 italic">
                        Remarks: {remarks}
                      </div>
                    )}
                  </td>

                  <td className="p-2">{b.mechanic?.name || "Unassigned"}</td>

                  <td className="p-2">
                    {canAssign && (
                      <>
                        <select
                          className="border px-1 py-1"
                          value={selectedMechanics[b.id] || ""}
                          onChange={(e) =>
                            handleSelectMechanic(b.id, e.target.value)
                          }
                        >
                          <option value="">Select Mechanic</option>
                          {mechanics.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>

                        <button
                          className={`ml-2 text-white px-2 py-1 rounded ${
                            isUpdate
                              ? "bg-orange-500 hover:bg-orange-600"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                          onClick={() => handleAssign(b.id)}
                        >
                          {isUpdate ? "Update" : "Assign"}
                        </button>

                        {localStorage.getItem("role") === "ROLE_ADMIN" && (
                          <button
                            className="ml-2 border text-red-600 px-2 py-1"
                            onClick={() => openCancelModal(b)}
                            disabled={cancellingIds[b.id]}
                          >
                            Cancel Booking
                          </button>
                        )}
                      </>
                    )}
                  </td>

                  <td className="p-2">
                  {status === "COMPLETED" && b.completed === true ? (
  <div className="flex items-center gap-3">
    {/* PRICE DISPLAY / INPUT */}
    {editingChargeId === b.id ? (
      <div className="flex items-center border rounded px-2 py-1 bg-white">
        <span className="text-gray-500 mr-1">₹</span>
        <input
          type="number"
          min="0"
          value={
            editedCharges[b.id] !== undefined
              ? editedCharges[b.id]
              : b.charges ?? ""
          }
          onChange={(e) =>
            setEditedCharges((prev) => ({
              ...prev,
              [b.id]: e.target.value,
            }))
          }
          className="w-20 outline-none"
        />
      </div>
    ) : (
      <span className="font-semibold text-gray-800">
        ₹ {b.charges ?? 0}
      </span>
    )}

    {/* ACTION BUTTON */}
    {editingChargeId === b.id ? (
      <button
        disabled={savingChargeId === b.id}
        onClick={async () => {
          setSavingChargeId(b.id);
          await handleChargesUpdate(
            b.id,
            Number(editedCharges[b.id])
          );
          setSavingChargeId(null);
          setEditingChargeId(null);
          setEditedCharges((prev) => {
            const copy = { ...prev };
            delete copy[b.id];
            return copy;
          });
        }}
        className={`px-3 py-1 rounded text-white text-sm transition ${
          savingChargeId === b.id
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {savingChargeId === b.id ? "Saving..." : "Save"}
      </button>
    ) : (
      <button
        onClick={() => {
          setEditingChargeId(b.id);
          setEditedCharges((prev) => ({
            ...prev,
            [b.id]: b.charges ?? "",
          }));
        }}
        className="px-3 py-1 rounded text-sm border border-blue-600 text-blue-600 hover:bg-blue-50"
      >
        Update Price
      </button>
    )}
  </div>
) : (
  <span className="text-gray-400">—</span>
)}



                  </td>
                </tr>
              );
            })}

            {bookings.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-500">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Cancel Booking</h3>
            <p className="text-sm text-gray-600 mb-2">Booking ID: {selectedBookingToCancel?.id}</p>

            <textarea
              placeholder="Enter cancellation reason (required)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full border p-2 rounded"
              style={{ minHeight: 120 }}
            />

            <div className="mt-4 flex gap-2 justify-end">
              <button
                disabled={!cancelReason.trim() || cancellingIds[selectedBookingToCancel?.id]}
                onClick={confirmCancel}
                className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
              >
                Confirm Cancel
              </button>

              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-1 border rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast: instant success message */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            backgroundColor: "#323232",
            color: "#fff",
            padding: "12px 18px",
            borderRadius: "6px",
            fontSize: "14px",
            zIndex: 1000,
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
          }}
        >
          ✅ {toastMessage}
        </div>
      )}

    </div>
  );
};

export default AdminViewBookings;
