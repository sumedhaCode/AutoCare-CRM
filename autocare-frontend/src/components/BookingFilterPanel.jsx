import React, { useState } from 'react';
import axios from 'axios';

const BookingFilterPanel = ({ setFilteredBookings }) => {
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const token = localStorage.getItem('token');

  const handleFilter = () => {
    axios.get('http://localhost:8080/api/admin/bookings/filter', {
      params: { status, startDate, endDate },
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setFilteredBookings(res.data))
    .catch(err => console.error("❌ Filter fetch failed:", err));
  };

  return (
    <div className="bg-white p-4 rounded shadow-md mt-6">
      <h2 className="text-lg font-bold mb-4">📋 Filter Bookings</h2>
      <div className="flex flex-wrap gap-4 items-center">
        <select
          className="border p-2 rounded"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />

        <button
          onClick={handleFilter}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
};

export default BookingFilterPanel;
