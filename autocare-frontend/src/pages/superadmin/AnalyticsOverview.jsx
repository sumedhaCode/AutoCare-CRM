import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnalyticsOverview = () => {
  const [data, setData] = useState({});
  const token = localStorage.getItem('token');

  // 🔁 UPDATED useEffect — ONLY revenue logic changed
  useEffect(() => {
    axios.get('http://localhost:8080/api/superadmin/admins', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const admins = res.data;

      const active = admins.filter(
        a => a.subscriptionStatus === "ACTIVE"
      ).length;

      const inactive = admins.filter(
        a => a.subscriptionStatus === "EXPIRED"
      ).length;

      // ✅ REAL total revenue
      const totalRevenue = admins
  .filter(admin => admin.subscriptionStatus === "ACTIVE")
  .reduce((sum, admin) => sum + (admin.planPrice || 0), 0);


      setData({
        totalRevenue,
        plan: "BASE",
        retentionRate: 0,
        activeGarages: active,
        inactiveGarages: inactive
      });
    });
  }, []);

  const chartData = {
    labels: ['Active Garages', 'Inactive Garages'],
    datasets: [
      {
        label: 'Garages',
        data: [data.activeGarages ?? 0, data.inactiveGarages ?? 0],
        backgroundColor: ['#34d399', '#f87171'],
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        📊 Analytics Overview
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-green-50 border border-green-100 rounded-xl p-5 text-center">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Total Revenue
          </h3>
          <p className="text-2xl font-bold text-green-700">
            ₹{data.totalRevenue ?? 0}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Plan
          </h3>
          <p className="text-lg font-semibold text-blue-700">
            {data.plan}
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 text-center">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Retention Rate
          </h3>
          <p className="text-2xl font-bold text-purple-700">
            {data.retentionRate ?? 0}%
          </p>
        </div>

        <div className="bg-gray-50 border rounded-xl p-5 text-center">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Garages
          </h3>
          <p className="text-sm text-gray-700">
            Active: <span className="font-semibold">{data.activeGarages ?? 0}</span>
          </p>
          <p className="text-sm text-gray-700">
            Inactive: <span className="font-semibold">{data.inactiveGarages ?? 0}</span>
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-gray-50 border rounded-xl p-6 max-w-3xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
          Active vs Inactive Garages
        </h3>
        <Bar data={chartData} />
      </div>
    </div>
  );
};

export default AnalyticsOverview;
