// src/pages/UpcomingBookings.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UpcomingBookings = () => {
  const [upcoming, setUpcoming] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/bookings/upcoming', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setUpcoming(res.data))
      .catch((err) => console.error('Failed to fetch upcoming bookings', err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>📬 Upcoming Bookings</h2>
      <table border="1" cellPadding="10" style={{ margin: 'auto' }}>
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Vehicle</th>
            <th>Service</th>
            <th>Date</th>
            <th>Mechanic</th>
          </tr>
        </thead>
        <tbody>
          {upcoming.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.vehicle?.number || '-'}</td>
              <td>{b.service?.name || '-'}</td>
              <td>{b.bookingDate}</td>
              <td>{b.mechanic?.name || '⏳ Pending'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UpcomingBookings;
