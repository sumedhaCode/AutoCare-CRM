import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { registerUser } from "../api";

const Register = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("ROLE_USER");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [garageName, setGarageName] = useState("");
  const [garageAddress, setGarageAddress] = useState("");

  // ✅ NEW — Admin subscription fields
  const [planDuration, setPlanDuration] = useState("");
  const [planPrice, setPlanPrice] = useState(0);

  // price mapping (safe constant)
  const PLAN_PRICING = {
    SIX_MONTHS: 599,
    ONE_YEAR: 999,
  };

  const [garageQuery, setGarageQuery] = useState("");
  const [garageResults, setGarageResults] = useState([]);
  const [selectedGarage, setSelectedGarage] = useState(null);

  const [loading, setLoading] = useState(false);

  const emailRegex = /^[a-z0-9._]+@gmail\.com$/;

  useEffect(() => {
    if (role !== "ROLE_STAFF") {
      setGarageQuery("");
      setGarageResults([]);
      setSelectedGarage(null);
    }
  }, [role]);

  const showError = (message) => {
    toast.dismiss();
    toast.error(message, { duration: 3000 });
  };

  const validateForm = () => {
    if (!name.trim()) return showError("Please fill your name"), false;

    if (!phoneNumber || phoneNumber.length !== 10)
      return showError("Phone number must be exactly 10 digits"), false;

    if (!email.trim()) return showError("Please fill your email"), false;

    if (email !== email.toLowerCase()) {
      return showError("Email must be lowercase only (e.g. name@gmail.com)");
    }

    if (!emailRegex.test(email)) {
      return showError("Please enter a valid Gmail address (e.g. name@gmail.com)");
    }

    if (!password) return showError("Please fill your password"), false;

    if (role === "ROLE_ADMIN") {
      if (!garageName.trim()) return showError("Please fill garage name"), false;
      if (!garageAddress.trim())
        return showError("Please fill garage address"), false;
      if (!planDuration)
        return showError("Please select subscription duration"), false;
    }

    if (role === "ROLE_STAFF" && !selectedGarage) {
      return showError("Please select a garage"), false;
    }

    return true;
  };

  const searchGarages = async (query) => {
    setGarageQuery(query);

    if (!query || query.length < 2) {
      setGarageResults([]);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:8080/api/public/garages/search?q=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setGarageResults(res.data);
    } catch {
      setGarageResults([]);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name,
      phoneNumber,
      email,
      password,
      role,
      ...(role === "ROLE_ADMIN" && {
        garageName,
        garageAddress,
        planName: "BASE",
        planDuration,
        planPrice: PLAN_PRICING[planDuration],
      }),
      ...(role === "ROLE_STAFF" && {
        adminId: selectedGarage.adminId,
      }),
    };

    setLoading(true);
    try {
      await registerUser(payload);
      toast.success("🎉 Registration successful!", { duration: 3000 });
      navigate("/login");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Registration failed",
        { duration: 3000 }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#eaf6fb" }}
    >
      <div className="w-full max-w-md">
        <form
          onSubmit={handleRegister}
          className="bg-white rounded-xl shadow-lg px-8 py-8 space-y-5"
        >
          <h2 className="text-3xl font-extrabold text-center">
            Create Account
          </h2>

          <div className="flex justify-center gap-6">
            {["ROLE_USER", "ROLE_ADMIN", "ROLE_STAFF"].map((r) => (
              <label key={r} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={role === r}
                  onChange={() => setRole(r)}
                />
                {r.replace("ROLE_", "")}
              </label>
            ))}
          </div>

          <input
            placeholder="Full Name"
            className="pl-4 pr-4 py-3 rounded-lg bg-[#f3f4f6] border w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Phone Number"
            className="pl-4 pr-4 py-3 rounded-lg bg-[#f3f4f6] border w-full"
            value={phoneNumber}
            maxLength={10}
            onChange={(e) =>
              setPhoneNumber(e.target.value.replace(/\D/g, ""))
            }
          />

          <input
            placeholder="Email Address (lowercase only)"
            className="pl-4 pr-4 py-3 rounded-lg bg-[#f3f4f6] border w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
          />

          <input
            type="password"
            placeholder="Password"
            className="pl-4 pr-4 py-3 rounded-lg bg-[#f3f4f6] border w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {role === "ROLE_STAFF" && (
            <div>
              <label className="block mb-1 font-medium">
                Search Garage Name or Address
              </label>
              <input
                className="pl-4 pr-4 py-3 rounded-lg bg-[#f3f4f6] border w-full"
                value={garageQuery}
                onChange={(e) => searchGarages(e.target.value)}
                placeholder="Type garage name or address..."
              />

              {garageResults.length > 0 && (
                <div className="border mt-1 rounded max-h-40 overflow-y-auto">
                  {garageResults.map((g) => (
                    <div
                      key={g.adminId}
                      onClick={() => {
                        setSelectedGarage(g);
                        setGarageQuery(
                          `${g.garageName} - ${g.garageAddress}`
                        );
                        setGarageResults([]);
                      }}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      <div className="font-medium">{g.garageName}</div>
                      <div className="text-sm text-gray-500">
                        {g.garageAddress}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {role === "ROLE_ADMIN" && (
            <>
              <input
                placeholder="Garage Name"
                className="pl-4 pr-4 py-3 rounded-lg bg-[#f3f4f6] border w-full"
                value={garageName}
                onChange={(e) => setGarageName(e.target.value)}
              />
              <input
                placeholder="Garage Address"
                className="pl-4 pr-4 py-3 rounded-lg bg-[#f3f4f6] border w-full"
                value={garageAddress}
                onChange={(e) => setGarageAddress(e.target.value)}
              />

              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-lg mb-2">
                  Get the Subscription
                </h3>

                <select
                  className="pl-4 pr-4 py-3 rounded-lg bg-[#f3f4f6] border w-full"
                  value={planDuration}
                  onChange={(e) => {
                    setPlanDuration(e.target.value);
                    setPlanPrice(PLAN_PRICING[e.target.value] || 0);
                  }}
                >
                  <option value="">Select Duration</option>
                  <option value="SIX_MONTHS">6 Months – ₹599</option>
                  <option value="ONE_YEAR">1 Year – ₹999</option>
                </select>

                {planPrice > 0 && (
                  <p className="mt-2 font-medium text-green-700">
                    Price: ₹{planPrice}
                  </p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg w-full disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
