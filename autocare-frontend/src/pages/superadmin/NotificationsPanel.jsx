
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  // Load existing in-app notifications
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/superadmin/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setNotifications(res.data))
      .catch(() => toast.error('Failed to load notifications'));
  }, [token]);

  // Send custom email to ACTIVE ADMINS
  const sendEmail = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please enter subject and message');
      return;
    }

    axios
      .post(
        'http://localhost:8080/api/superadmin/send-email',
        { subject, message },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        toast.success('Email sent to active admins');
        setSubject('');
        setMessage('');
      })
      .catch(() => toast.error('Failed to send email'));
  };

  const deleteNotification = (id) => {
    axios
      .delete(`http://localhost:8080/api/superadmin/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        toast.success('Notification deleted');
        setNotifications(prev => prev.filter(n => n.id !== id));
      })
      .catch(() => toast.error('Failed to delete notification'));
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        🔔 Notifications & Emails
      </h2>

      {/* Send Email */}
      <div className="bg-gray-50 border rounded-lg p-4 mb-8">
        <h3 className="text-lg font-semibold mb-3">
          Send Email to Active Admins
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject (e.g. 🎉 Happy Diwali)"
            className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Email message"
            rows="4"
            className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mt-4 text-right">
          <button
            onClick={sendEmail}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Send Email
          </button>
        </div>
      </div>

      {/* Notifications Table (In-App Only) */}
      <div className="overflow-x-auto">
        <table className="w-full border rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Message</th>
              <th className="p-3 text-left">Target</th>
              <th className="p-3 text-left">Sent At</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  No notifications found
                </td>
              </tr>
            ) : (
              notifications.map((n) => (
                <tr key={n.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{n.message}</td>
                  <td className="p-3 font-medium">{n.targetRole}</td>
                  <td className="p-3 text-sm text-gray-600">
                    {n.sentAt?.replace('T', ' ').slice(0, 16)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() =>
                        window.confirm(
                          'Are you sure you want to delete this notification?'
                        ) && deleteNotification(n.id)
                      }
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationsPanel;
