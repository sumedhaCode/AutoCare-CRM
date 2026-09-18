import React from 'react';

const BookingModal = ({ booking, closeModal }) => {
  if (!booking) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '10px',
        width: '90%',
        maxWidth: '500px'
      }}>
        <h2>Booking Details</h2>
        <p><strong>ID:</strong> {booking.id}</p>
        <p><strong>Vehicle:</strong> {booking.vehicle?.number} ({booking.vehicle?.model})</p>
        <p><strong>Service:</strong> {booking.service?.name}</p>
       <p><strong>Date:</strong> {booking.bookingDate}</p>

        <p><strong>Status:</strong> {booking.status}</p>
        <p><strong>Mechanic:</strong> {booking.mechanic?.name || 'Unassigned'}</p>
        <button onClick={closeModal}>Close</button>
      </div>
    </div>
  );
};

export default BookingModal;
