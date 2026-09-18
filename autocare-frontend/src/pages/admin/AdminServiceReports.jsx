import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminServiceReports = () => {
  const [summary, setSummary] = useState(null);
  const [mechanics, setMechanics] = useState([]);

  // 🔔 Listen for charge updates
  const [lastUpdatedAt, setLastUpdatedAt] = useState(
    localStorage.getItem("lastChargesUpdate")
  );

  useEffect(() => {
    const handler = () => {
      setLastUpdatedAt(localStorage.getItem("lastChargesUpdate"));
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          "http://localhost:8080/api/admin/bookings",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const bookings = Array.isArray(res.data)
          ? res.data
          : res.data?.content || [];

        let totalRevenue = 0;
        let totalCompleted = 0;
        let weekly = 0;
        let monthly = 0;

        const mechanicMap = {};

        const now = new Date();

        bookings.forEach((b) => {
          if (b.status === "COMPLETED") {
            totalCompleted += 1;

            const charges = Number(b.charges) || 0;
            totalRevenue += charges;

            const completedDate = new Date(b.bookingDate);
            const diffDays =
              (now - completedDate) / (1000 * 60 * 60 * 24);

            if (diffDays <= 7) weekly += 1;
            if (diffDays <= 30) monthly += 1;

            const mechName = b.mechanic?.name;
            if (mechName) {
              if (!mechanicMap[mechName]) {
                mechanicMap[mechName] = {
                  mechanicName: mechName,
                  completedJobs: 0,
                  totalRevenue: 0,
                };
              }
              mechanicMap[mechName].completedJobs += 1;
              mechanicMap[mechName].totalRevenue += charges;
            }
          }
        });

        if (mounted) {
          setSummary({
            totalCompleted,
            totalRevenue,
            weekly,
            monthly,
          });

          setMechanics(Object.values(mechanicMap));
        }
      } catch (err) {
        console.error("❌ Failed to load reports", err);
      }
    };

    fetchReports();
    return () => (mounted = false);
  }, [lastUpdatedAt]); // ✅ RE-FETCH WHEN CHARGES CHANGE

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h2 className="text-3xl font-bold mb-8">
        📊 Service & Reports
      </h2>

      {/* Overall Summary */}
      {summary && (
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4">
            Overall Summary
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <SummaryCard
              key="total"
              label="Total Bookings"
              value={summary.totalCompleted ?? 0}
              icon="📦"
              bg="from-slate-300 to-slate-100"
            />

            <SummaryCard
              key="revenue"
              label="Total Revenue"
              value={`₹ ${summary.totalRevenue ?? 0}`}
              icon="💰"
              bg="from-blue-200 to-blue-50"
            />

            <SummaryCard
              key="weekly"
              label="Weekly Jobs"
              value={summary.weekly ?? 0}
              icon="📆"
              bg="from-indigo-200 to-indigo-50"
            />

            <SummaryCard
              key="monthly"
              label="Monthly Jobs"
              value={summary.monthly ?? 0}
              icon="📊"
              bg="from-amber-200 to-amber-50"
            />
          </div>
        </div>
      )}

      {/* Mechanic Performance */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold mb-4">
          Mechanic Performance
        </h3>

        {mechanics.length === 0 ? (
          <p className="text-gray-500">No mechanic data available.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Mechanic</th>
                <th className="p-2 text-left">Jobs Completed</th>
                <th className="p-2 text-left">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {mechanics.map((m) => (
                <tr key={m.mechanicName} className="border-b">
                  <td className="p-2">{m.mechanicName}</td>
                  <td className="p-2">{m.completedJobs}</td>
                  <td className="p-2">₹ {m.totalRevenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/* ---------- Summary Card ---------- */
const SummaryCard = ({ label, value, icon, bg }) => (
  <div
    className={`
      relative rounded-2xl p-6
      bg-gradient-to-br ${bg}
      shadow-md ring-1 ring-gray-200
    `}
  >
    <div className="absolute right-4 top-4 text-3xl opacity-35">
      {icon}
    </div>

    <div className="text-sm text-gray-600 mb-1">
      {label}
    </div>
    <div className="text-2xl font-bold">
      {value}
    </div>
  </div>
);

export default AdminServiceReports;
