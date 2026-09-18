import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/superadmin';

  useEffect(() => {
    const raw = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!raw || !token) {
      toast.error('Unauthorized access');
      navigate('/unauthorized', { replace: true });
      return;
    }

    const user = JSON.parse(raw);
    const authorities = user?._raw?.authorities?.map(a => a.authority) || [];

    if (
      user.role !== 'ROLE_SUPER_ADMIN' &&
      !authorities.includes('ROLE_SUPER_ADMIN')
    ) {
      toast.error('Unauthorized access');
      navigate('/unauthorized', { replace: true });
      return;
    }

    // 🔁 UPDATED fetchSummary — ONLY revenue logic changed
    const fetchSummary = async () => {
      try {
        const res = await fetch(
          'http://localhost:8080/api/superadmin/admins',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error();

        const admins = await res.json();

        const totalAdmins = admins.length;

const retainedAdmins = admins.filter(a =>
  !a.suspended && a.subscriptionStatus !== "EXPIRED"
).length;

const retentionRate =
  totalAdmins === 0
    ? 0
    : Math.round((retainedAdmins / totalAdmins) * 100);

const activeGarages = admins.filter(
  a => !a.suspended && a.subscriptionStatus === "ACTIVE"
).length;

const inactiveGarages = admins.filter(
  a => a.subscriptionStatus === "EXPIRED" || a.suspended
).length;


        // ✅ REAL total revenue
        const totalRevenue = admins
  .filter(admin =>
  admin.subscriptionStatus === "ACTIVE" &&
  admin.subscriptionEndAt &&
  new Date(admin.subscriptionEndAt) > new Date()
)

  .reduce((sum, admin) => {
    return sum + (admin.planPrice || 0);
  }, 0);


        setSummary({
  totalRevenue,
  plan: "BASE",
  retentionRate,
  activeGarages,
  inactiveGarages,
  adminCount: totalAdmins
});


      } catch {
        toast.error('Failed to load dashboard summary');
      } finally {
        setLoading(false);
      }
    };

    if (isHome) fetchSummary();
  }, [navigate, isHome]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-8">🚀 Super Admin Dashboard</h1>

      {isHome && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          <div className="rounded-xl p-5 bg-gradient-to-br from-green-50 to-green-100 shadow-sm">
            <h3 className="text-sm text-gray-600">Total Revenue</h3>
            <p className="text-2xl font-semibold text-green-700 mt-2">
              ₹{summary.totalRevenue ?? 0}
            </p>
          </div>

          <div className="rounded-xl p-5 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-sm">
            <h3 className="text-sm text-gray-600">Plan</h3>
            <p className="text-xl font-semibold text-indigo-700 mt-2">
              {summary.plan}
            </p>
          </div>

          <div className="rounded-xl p-5 bg-gradient-to-br from-violet-50 to-purple-100 shadow-sm">
            <h3 className="text-sm text-gray-600">Retention Rate</h3>
            <p className="text-2xl font-semibold text-purple-700 mt-2">
              {summary.retentionRate ?? 0}%
            </p>
          </div>

          <div className="rounded-xl p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-sm">
            <h3 className="text-sm text-gray-600">Active Garages</h3>
            <p className="text-2xl font-semibold text-emerald-700 mt-2">
              {summary.activeGarages ?? 0}
            </p>
          </div>

          <div className="rounded-xl p-5 bg-gradient-to-br from-orange-50 to-red-100 shadow-sm">
            <h3 className="text-sm text-gray-600">Inactive Garages</h3>
            <p className="text-2xl font-semibold text-red-600 mt-2">
              {summary.inactiveGarages ?? 0}
            </p>
          </div>

          <div className="rounded-xl p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-sm">
            <h3 className="text-sm text-gray-600">Total Admins</h3>
            <p className="text-2xl font-semibold text-indigo-700 mt-2">
              {summary.adminCount ?? 0}
            </p>
          </div>

        </div>
      )}

      {isHome && (
        <nav className="flex gap-4 mb-10 flex-wrap">
          <Link to="admins" className="px-4 py-2 rounded-lg bg-white shadow-sm font-medium">
            👥 Admins
          </Link>
          <Link to="subscriptions" className="px-4 py-2 rounded-lg bg-white shadow-sm font-medium">
            💳 Subscriptions
          </Link>
          <Link to="analytics" className="px-4 py-2 rounded-lg bg-white shadow-sm font-medium">
            📊 Analytics
          </Link>
          <Link to="notifications" className="px-4 py-2 rounded-lg bg-white shadow-sm font-medium">
            🔔 Notifications
          </Link>
          <Link to="renewal-requests" className="px-4 py-2 rounded-lg bg-white shadow-sm font-medium">
  🔄 Renewal Requests
</Link>

        </nav>
      )}

      <Outlet />
    </div>
  );
};

export default SuperAdminDashboard;
