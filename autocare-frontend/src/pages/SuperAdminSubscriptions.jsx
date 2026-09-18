import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

/* ================= STATUS DERIVATION (DISPLAY ONLY) ================= */
const getAdminStatus = (admin) => {
  if (!admin.subscriptionEndAt) return admin.subscriptionStatus;

  const now = new Date();
  const end = new Date(admin.subscriptionEndAt);

  const diffDays = Math.ceil(
    (end - now) / (1000 * 60 * 60 * 24)
  );

  if (
    admin.subscriptionStatus === "ACTIVE" &&
    diffDays > 0 &&
    diffDays <= 7
  ) {
    return "EXPIRING";
  }

  return admin.subscriptionStatus;
};
/* =================================================================== */

export default function SuperAdminSubscriptions() {
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/superadmin/admins", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setSubs(res.data));
  }, []);

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-y-3">
          <thead>
            <tr>
              <th className="px-5 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                Garage
              </th>
              <th className="px-5 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                Email
              </th>
              <th className="px-5 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                Plan Duration
              </th>
              <th className="px-5 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                Price
              </th>
              <th className="px-5 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                End Date
              </th>
              <th className="px-5 py-3 text-center text-sm font-bold text-gray-700 uppercase tracking-wide">
                Subscription Status
              </th>
            </tr>
          </thead>

          <tbody>
            {subs.map((s) => {
              const status = getAdminStatus(s);

              return (
                <tr
                  key={s.email}
                  className="bg-white shadow-sm rounded-lg hover:shadow-md transition"
                >
                  <td className="px-5 py-4 text-sm font-medium text-gray-900 rounded-l-lg">
                    {s.garageName || "-"}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-700">
                    {s.email}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-700">
                    {s.planDuration === "SIX_MONTHS"
                      ? "6 Months"
                      : "1 Year"}
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                    ₹{s.planPrice}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-700">
                    {dayjs(s.subscriptionEndAt).format("DD MMM YYYY")}
                  </td>

                  {/* ✅ DERIVED STATUS */}
                  <td className="px-5 py-4 text-center rounded-r-lg">
                    {status === "ACTIVE" && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        ACTIVE
                      </span>
                    )}

                    {status === "EXPIRING" && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        EXPIRING
                      </span>
                    )}

                    {status === "EXPIRED" && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        EXPIRED
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {subs.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No subscriptions found.
          </div>
        )}
      </div>
    </div>
  );
}
