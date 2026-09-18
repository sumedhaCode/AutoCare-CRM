// src/components/BookingTable.jsx
import React, { useState } from "react";
import { CSVLink } from "react-csv";
import { assignMechanicToBooking /*, createTaskForBooking*/ } from "../api";
import { toast } from "react-toastify";

const BookingTable = ({ bookings, mechanics, onMechanicAssignSuccess }) => {
  const [selectedMechanic, setSelectedMechanic] = useState({});
  const [loadingAssignId, setLoadingAssignId] = useState(null);

  const headers = [
    { label: "Booking ID", key: "id" },
    { label: "License Plate", key: "vehicle.licensePlate" },
    { label: "Service", key: "service.name" },
    { label: "Date", key: "bookingDate" },
    { label: "Status", key: "status" },
    { label: "Mechanic", key: "mechanic.name" },
  ];

  const handleMechanicChange = (bookingId, mechanicId) => {
    setSelectedMechanic((prev) => ({
      ...prev,
      [bookingId]: mechanicId,
    }));
  };

  const handleAssignMechanic = async (bookingId) => {
    const mechanicIdToAssign = selectedMechanic[bookingId];

    if (!mechanicIdToAssign) {
      toast.error("Please select a mechanic to assign.");
      return;
    }

    setLoadingAssignId(bookingId);
    try {
      // ✅ Use API helper + await
      await assignMechanicToBooking(bookingId, mechanicIdToAssign);
      // Optional:
      // await createTaskForBooking(bookingId, mechanicIdToAssign);

      toast.success(`✅ Mechanic assigned to Booking ID: ${bookingId}`);

      if (onMechanicAssignSuccess) {
        onMechanicAssignSuccess(); // trigger refresh in parent
      }

      // Clear selection for this booking
      setSelectedMechanic((prev) => {
        const newState = { ...prev };
        delete newState[bookingId];
        return newState;
      });
    } catch (err) {
      console.error("❌ Failed to assign mechanic:", err);
      const errorMessage =
        err?.response?.data?.message ||
        "Failed to assign mechanic. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoadingAssignId(null);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-md mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">📅 Bookings</h2>
        <CSVLink
          data={bookings}
          headers={headers}
          filename="garage-bookings.csv"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Export CSV
        </CSVLink>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Booking ID</th>
              <th className="border px-4 py-2 text-left">Vehicle</th>
              <th className="border px-4 py-2 text-left">Service</th>
              <th className="border px-4 py-2 text-left">Date</th>
              <th className="border px-4 py-2 text-left">Status</th>
              <th className="border px-4 py-2 text-left">Mechanic</th>
              <th className="border px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{booking.id}</td>
                  <td className="border px-4 py-2">
                    {booking.vehicle?.licensePlate}
                  </td>
                  <td className="border px-4 py-2">
                    {booking.service?.name}
                  </td>
                  <td className="border px-4 py-2">
                    {booking.bookingDate}
                  </td>
                  <td className="border px-4 py-2">{booking.status}</td>
                  <td className="border px-4 py-2">
                    {booking.mechanic?.name ?? "⏳ Unassigned"}
                  </td>
                  <td className="border px-4 py-2">
                    {!booking.mechanic ? (
                      <div className="flex items-center space-x-2">
                        <select
                          className="border rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                          onChange={(e) =>
                            handleMechanicChange(
                              booking.id,
                              e.target.value
                            )
                          }
                          value={selectedMechanic[booking.id] || ""}
                        >
                          <option value="">Select Mechanic</option>
                          {mechanics.map((mech) => (
                            <option key={mech.userId} value={mech.userId}>
                              {mech.name || mech.email}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssignMechanic(booking.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          disabled={
                            !selectedMechanic[booking.id] ||
                            loadingAssignId === booking.id
                          }
                        >
                          {loadingAssignId === booking.id
                            ? "Assigning…"
                            : "Assign"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-600 text-sm">
                        Assigned
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-4 text-gray-500"
                >
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTable;


