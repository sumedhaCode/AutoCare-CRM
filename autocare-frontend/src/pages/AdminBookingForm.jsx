import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminBookingForm = ({ onCreated }) => {
  const token = localStorage.getItem("token");

  // Customer
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // ===============================
  // STRICT EMAIL REGEX (LOWERCASE ONLY)
  // ===============================
  const GMAIL_REGEX = /^[a-z0-9._]+@gmail\.com$/;
  const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$/;

  // Phone handlers (unchanged)
  const handlePhoneChange = (e) => {
    const raw = e.target.value || '';
    const digits = raw.replace(/\D/g, '');
    if (digits.length > 10) {
      alert('Only 10 digits are allowed');
      setCustomerPhone(digits.slice(0, 10));
      return;
    }
    setCustomerPhone(digits);
  };

  const handlePhoneKeyDown = (e) => {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (allowedKeys.includes(e.key)) return;

    if (/^\d$/.test(e.key) && customerPhone.length >= 10) {
      e.preventDefault();
      alert('Only 10 digits are allowed');
    }
  };

  const handlePhonePaste = (e) => {
    const paste = (e.clipboardData || window.clipboardData).getData('text') || '';
    const digits = paste.replace(/\D/g, '');
    if (digits.length + customerPhone.length > 10) {
      e.preventDefault();
      alert('Only 10 digits are allowed');
    }
  };

  // Booking
  const [vehicleModel, setVehicleModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [slotTime, setSlotTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ===============================
    // REQUIRED FIELD CHECK
    // ===============================
    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !vehicleModel ||
      !licensePlate ||
      !serviceType ||
      !bookingDate ||
      !slotTime
    ) {
      toast.error('Please fill all the details');
      return;
    }

    // ===============================
    // 🔥 STRICT EMAIL VALIDATION
    // ===============================
    if (customerEmail !== customerEmail.toLowerCase()) {
      toast.error("Email must be lowercase only (e.g. name@gmail.com)");
      return;
    }

    if (!GMAIL_REGEX.test(customerEmail)) {
      toast.error(
        "Please enter a valid Gmail address (e.g. name@gmail.com)"
      );
      return;
    }

    // ===============================
    // PHONE VALIDATION
    // ===============================
    if (!/^\d{10}$/.test(customerPhone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    // ===============================
    // DATE & TIME VALIDATION
    // ===============================
    const now = new Date();
    const selectedDateTime = new Date(`${bookingDate}T${slotTime}:00`);

    if (selectedDateTime <= now) {
      toast.error('Please select a future date and time');
      return;
    }

    if (!VEHICLE_REGEX.test(licensePlate)) {
      alert('Invalid vehicle number. Use format: MH01AB1234');
      return;
    }

    const payload = {
      customerName,
      customerEmail,
      customerPhone,
      serviceName: serviceType,
      vehicleModel,
      licensePlate,
      bookingDate,
      slotTime,
    };

    setLoading(true);
    try {
      await axios.post(
        'http://localhost:8080/api/admin/bookings',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('Booking created successfully');

      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setVehicleModel('');
      setLicensePlate('');
      setServiceType('');
      setBookingDate('');
      setSlotTime('');

      if (onCreated) onCreated();
    } catch {
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#f5f7fb]">
      <div className="bg-white shadow-xl rounded-2xl px-10 py-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Admin Walk-In Booking
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Customer Full Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="email"
            placeholder="Customer Email (lowercase only)"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value.trim())}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="tel"
            placeholder="Customer Phone (10 digits)"
            value={customerPhone}
            onChange={handlePhoneChange}
            onKeyDown={handlePhoneKeyDown}
            onPaste={handlePhonePaste}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="text"
            placeholder="Vehicle Model"
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="text"
            placeholder="License Plate (e.g. MH01AB1234)"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value.toUpperCase().replace(/\s+/g, ""))}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="text"
            placeholder="Service Type"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="time"
            value={slotTime}
            onChange={(e) => setSlotTime(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-blue-700 text-white py-3 rounded-lg"
          >
            {loading ? 'Creating…' : 'Create Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminBookingForm;
