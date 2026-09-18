import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // required for accessibility

const BookingDetailsModal = ({ isOpen, onClose, booking }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose} // 👈 handles outside click or Esc
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="p-4">
        <h2 className="text-xl font-bold">Booking Details</h2>
        <p><strong>Customer:</strong> {booking.customerName}</p>
        <p><strong>Status:</strong> {booking.status}</p>
        <button className="mt-4 bg-red-500 text-white px-3 py-1 rounded" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
};

export default BookingDetailsModal;
