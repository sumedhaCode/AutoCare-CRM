import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const RenewalRequests = () => {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/superadmin/renewal-requests", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setRequests(res.data || []);
      })
      .catch(() => toast.error("Failed to load renewal requests"));
  }, [token]);

  const approve = async (id) => {
    try {
      await axios.post(
        `http://localhost:8080/api/superadmin/renewal-requests/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Renewal approved");

      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "APPROVED" } : r
        )
      );
    } catch {
      toast.error("Failed to approve renewal");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-2xl font-bold mb-6">
        🔄 Plan Renewal Requests
      </h2>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Admin Email</th>
            <th className="p-2 text-left">Garage</th>
            <th className="p-2 text-left">Duration</th>
            <th className="p-2 text-left">Requested At</th>
            <th className="p-2 text-center">Status</th>
            <th className="p-2 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                className="text-center py-6 text-gray-500"
              >
                No renewal requests
              </td>
            </tr>
          ) : (
            requests.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">
                  {r.admin?.email || "-"}
                </td>
                <td className="p-2">
                  {r.admin?.garageName || "-"}
                </td>
                <td className="p-2">
                  {r.requestedDuration === "ONE_YEAR"
                    ? "12 Months"
                    : "6 Months"}
                </td>
                <td className="p-2">
                  {r.requestedAt
                    ? r.requestedAt.replace("T", " ").slice(0, 16)
                    : "-"}
                </td>
                <td className="p-2 text-center">
                  <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs">
                    {r.status}
                  </span>
                </td>
                <td className="p-2 text-center">
                  {r.status === "PENDING" && (
                    <button
                      onClick={() => approve(r.id)}
                      className="bg-green-600 text-white px-4 py-1 rounded"
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RenewalRequests;
