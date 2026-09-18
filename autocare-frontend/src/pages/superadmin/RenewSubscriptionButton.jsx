import React from 'react';
import toast from 'react-hot-toast';

const RenewSubscriptionButton = ({ adminId }) => {
  const handleRenew = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:8080/api/superadmin/subscriptions/user/${adminId}/renew`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("✅ Renewed all subscriptions");
    } catch (err) {
      toast.error("❌ Failed to renew subscriptions");
    }
  };

  return (
    <button onClick={handleRenew} className="bg-blue-600 text-white px-4 py-2 rounded">
      Renew Subscriptions
    </button>
  );
};

export default RenewSubscriptionButton;
