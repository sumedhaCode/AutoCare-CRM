// src/pages/BookingForm.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { createUserSimpleBooking } from "../api";

const BookingForm = ({ onBookingSuccess }) => {
  const [serviceType, setServiceType] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Garage search state
  const [garageQuery, setGarageQuery] = useState("");
  const [garageResults, setGarageResults] = useState([]);
  const [selectedGarage, setSelectedGarage] = useState(null);

  const navigate = useNavigate();

  // ❌ Prevent past booking
  const isBookingDateTimeValid = (date, time) => {
    if (!date || !time) return false;
    const now = new Date();
    const selectedDateTime = new Date(`${date}T${time}`);
    if (isNaN(selectedDateTime.getTime())) return false;
    return selectedDateTime > now;
  };

  // � STRICT EMAIL REGEX (LOWERCASE ONLY)
  const emailRegex = /^[a-z0-9._]+@[a-z0-9]+\.[a-z]{2,}$/;
  const isValidEmail = (email) => emailRegex.test(email);
  const GMAIL_REGEX = /^[a-z0-9._]+@gmail\.com$/;
  const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$/;
  // �🔹 Fetch garage suggestions (WITH AUTH HEADER)
  useEffect(() => {
    if (garageQuery.length < 2) {
      setGarageResults([]);
      return;
    }

    const fetchGarages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/public/garages/search?q=${encodeURIComponent(garageQuery)}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setGarageResults(res.data);

        // Auto-select if only one result
        if (res.data.length === 1) {
          setSelectedGarage(res.data[0]);
        }
      } catch (err) {
        console.error("Garage search failed", err);
      }
    };

    fetchGarages();
  }, [garageQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedEmail =
      localStorage.getItem("email") ||
      JSON.parse(localStorage.getItem("user") || "{}")?.email;

    if (!storedEmail || !GMAIL_REGEX.test(storedEmail)) {
      toast.error(
        "Please use a valid Gmail address (e.g. name@gmail.com)"
      );
      return;
    }

    if (!isBookingDateTimeValid(date, time)) {
      toast.error("❌ You cannot book a service for a past date or time.");
      return;
    }

    if (!serviceType || !vehicleModel || !licensePlate || !date || !time) {
      toast.error("❌ Please fill all fields");
      return;
    }

    if (!VEHICLE_REGEX.test(licensePlate)) {
      alert(
        "Invalid vehicle number.\nUse format: AA00AA0000 (e.g. MH01AB1234)"
      );
      return;
    }

    // ✅ Garage must be selected
    if (!selectedGarage) {
      toast.error("❌ Please select a garage from the list", {
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        serviceType,
        vehicleModel,
        licensePlate,
        bookingDate: `${date}T${time}`,
        slotTime: time,
        adminId: selectedGarage.adminId, // 🔑 CRITICAL LINK
      };

      const res = await createUserSimpleBooking(payload);

      toast.success("Booking created successfully!", { duration: 3500 });

      if (onBookingSuccess) onBookingSuccess(res.data);

      // Reset form
      setServiceType("");
      setVehicleModel("");
      setLicensePlate("");
      setDate("");
      setTime("");
      setGarageQuery("");
      setGarageResults([]);
      setSelectedGarage(null);

      setTimeout(() => {
        navigate("/booking-history");
      }, 2000);
    } catch (err) {
      console.error("Failed to create booking", err);
      toast.error("❌ Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Booking</h2>

      <form onSubmit={handleSubmit}>
        {/* Garage Search */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">
            Search Garage Name or Address
          </label>
          <input
            type="text"
            placeholder="Search Garage Name or Address"
            value={garageQuery}
            onChange={(e) => setGarageQuery(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          {garageResults.length > 0 && (
            <div className="border rounded mt-1 bg-white shadow">
              {garageResults.map((g) => (
                <div
                  key={g.adminId}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedGarage(g);
                    setGarageQuery(
                      `${g.garageName} - ${g.garageAddress}`
                    );
                    setGarageResults([]);
                  }}
                >
                  <strong>{g.garageName}</strong>
                  <div className="text-xs text-gray-500">
                    {g.garageAddress}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Service */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Service</label>
          <input
            type="text"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* Vehicle Model */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Vehicle Model</label>
          <input
            type="text"
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* License Plate */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">License Plate</label>
          <input
            type="text"
            placeholder="Vehicle Number (e.g. MH01AB1234)"
            value={licensePlate}
            onChange={(e) =>
              setLicensePlate(
                e.target.value.toUpperCase().replace(/\s+/g, "")
              )
            }
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* Time */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create Booking"}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
