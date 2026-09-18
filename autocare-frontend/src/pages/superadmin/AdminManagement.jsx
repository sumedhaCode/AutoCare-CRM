import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

/* ================= STATUS DERIVATION ================= */
const getAdminStatus = (admin) => {
  if (!admin.subscriptionEndAt) return admin.subscriptionStatus;

  const now = new Date();
  const end = new Date(admin.subscriptionEndAt);

  const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

  if (
    admin.subscriptionStatus === "ACTIVE" &&
    diffDays > 0 &&
    diffDays <= 7
  ) {
    return "EXPIRING";
  }

  return admin.subscriptionStatus;
};
/* ===================================================== */

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;

    axios.get('http://localhost:8080/api/superadmin/admins', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setAdmins(res.data));
  }, [token]);

  const suspendAdmin = (userId) => {
    axios.patch(
      `http://localhost:8080/api/superadmin/admins/${userId}/suspend`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(() => {
      toast.success("Admin suspended");
      setAdmins(prev =>
        prev.map(a =>
          a.userId === userId ? { ...a, suspended: true } : a
        )
      );
    });
  };

  const deleteAdmin = (userId) => {
    axios.delete(
      `http://localhost:8080/api/superadmin/admins/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(() => {
      toast.success("Admin deleted");
      setAdmins(prev => prev.filter(a => a.userId !== userId));
    });
  };

  const confirmAndSuspend = (userId) => {
    if (window.confirm("Are you sure you want to suspend this admin?")) {
      suspendAdmin(userId);
    }
  };

  const confirmAndDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      deleteAdmin(userId);
    }
  };

  const formatPlanDuration = (admin) => {
    if (!admin.planDuration) return "-";

    const durationLabel =
      admin.planDuration === "SIX_MONTHS"
        ? "6 Months"
        : admin.planDuration === "ONE_YEAR"
        ? "1 Year"
        : admin.planDuration;

    const planLabel = admin.planType || admin.planName || "";

    return planLabel ? `${planLabel} – ${durationLabel}` : durationLabel;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        👥 Admin Management
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-sm font-bold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Role</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Plan</th>
              <th className="px-4 py-3 text-center text-sm font-bold">Status</th>
              <th className="px-4 py-3 text-right text-sm font-bold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {admins.map((admin) => {
              const status = getAdminStatus(admin);

              return (
                <tr
                  key={admin.userId}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-4">
                    <div className="font-medium">{admin.email}</div>
                  </td>

                  <td className="px-4 py-4">{admin.role}</td>

                  <td className="px-4 py-4">{formatPlanDuration(admin)}</td>

                  <td className="px-4 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${status === 'ACTIVE' && 'bg-green-100 text-green-700'}
                      ${status === 'EXPIRING' && 'bg-yellow-100 text-yellow-700'}
                      ${status === 'EXPIRED' && 'bg-red-100 text-red-700'}
                    `}>
                      {status}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => confirmAndSuspend(admin.userId)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded"
                      >
                        Suspend
                      </button>
                      <button
                        onClick={() => confirmAndDelete(admin.userId)}
                        className="px-4 py-2 bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminManagement;
