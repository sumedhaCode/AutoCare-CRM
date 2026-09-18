import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Wrench, Users, Mail, User } from "lucide-react";

// 🔹 Minimal UI Components
const Button = ({ children, onClick, disabled, className = "", ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={`border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none px-3 py-2 rounded-md w-full text-sm transition ${className}`}
    {...props}
  />
);

const Label = ({ children, htmlFor, className = "" }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
  >
    {children}
  </label>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white p-6 md:p-7 rounded-2xl shadow-md border border-gray-100 ${className}`}
  >
    {children}
  </div>
);

const Badge = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center justify-center min-w-[1.75rem] px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 ${className}`}
  >
    {children}
  </span>
);

// 🔹 Utility
function getInitials(name = "") {
  return (
    name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2) || "?"
  );
}

function AddMechanic() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "success" });
  const token = localStorage.getItem("token");

  // 🔹 Toast helper
  const showToast = (
    message,
    type = "success",
    duration = 2500,
    options = {}
  ) => {
    const { clearForm = false, refreshList = false } = options;

    setToast({ message, type });

    if (duration > 0) {
      setTimeout(() => {
        setToast((prev) => ({ ...prev, message: "" }));

        if (clearForm) {
          setName("");
          setEmail("");
        }

        if (refreshList) {
          fetchMechanics();
        }
      }, duration);
    }
  };

  // 🔹 Add mechanic
  const handleAdd = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      showToast("Please fill in both name and email fields.", "error", 3000);
      return;
    }

    const GMAIL_REGEX = /^[a-z0-9._]+@gmail\.com$/;
    if (!GMAIL_REGEX.test(trimmedEmail)) {
      showToast(
        "Please enter a valid Gmail address (e.g. name@gmail.com)",
        "error",
        3000
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/mechanics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail }),
      });

      if (!response.ok) {
        const errorText = (await response.text()) || "";

        // OPTION B APPLIED HERE ✅
        if (errorText.toLowerCase().includes("not registered")) {
          showToast("Mechanic is not registered", "error", 3000, {
            clearForm: true,
            refreshList: true,
          });
        } else if (
          errorText.toLowerCase().includes("another garage")
        ) {
          showToast(
            "This staff member belongs to another garage",
            "error",
            3000,
            {
              clearForm: true,
              refreshList: true,
            }
          );
        } else {
          showToast(errorText || "Failed to add mechanic.", "error", 3000);
        }
        return;
      }

      showToast("Mechanic added successfully! 🎉", "success", 2500, {
        clearForm: true,
        refreshList: true,
      });
    } catch (err) {
      showToast("Network error: " + err.message, "error", 3000);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch mechanics
  const fetchMechanics = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/mechanics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMechanics(res.data || []);
    } catch {
      // silent fail
    }
  };

  // 🔹 Delete mechanic
  const handleDelete = async (id, mechanicName) => {
    try {
      await axios.delete(`http://localhost:8080/api/mechanics/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showToast(
        `${mechanicName} has been deleted successfully.`,
        "success",
        2500,
        { refreshList: true }
      );
    } catch (err) {
      const status = err.response?.status;

      if (status === 403) {
        showToast(
          "Failed to delete. Mechanic is linked to existing bookings.",
          "error",
          3200
        );
      } else {
        showToast("❌ Failed to delete mechanic.", "error", 3000);
      }
    }
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  const isError = toast.type === "error";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {toast.message && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center pointer-events-none">
          <div
            className={`pointer-events-auto max-w-xl w-[90%] px-6 py-3 rounded-xl shadow-lg text-base font-semibold text-center ${
              isError
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-green-100 text-green-800 border border-green-200"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white shadow-md mb-1">
            <Wrench className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Mechanic Management
          </h1>
          <p className="text-gray-600">
            Add and manage your team of skilled mechanics.
          </p>
        </div>

        <Card>
          <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Add New Mechanic
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>
                <User className="inline w-4 h-4 mr-1" />
                Full Name
              </Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>
                <Mail className="inline w-4 h-4 mr-1" />
                Email Address
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
              />
            </div>
          </div>

          <Button onClick={handleAdd} disabled={loading} className="w-full">
            {loading ? "Adding mechanic..." : "Add Mechanic"}
          </Button>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            Team Members
            <Badge>{mechanics.length}</Badge>
          </h2>

          {mechanics.length === 0 ? (
            <p className="text-sm text-gray-500">No mechanics added yet.</p>
          ) : (
            <div className="space-y-3">
              {mechanics.map((m) => (
                <div
                  key={m.id}
                  className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {getInitials(m.name || m.email)}
                    </div>
                    <div>
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-xs text-gray-600">{m.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete mechanic "${m.name || m.email}"?`
                        )
                      ) {
                        handleDelete(m.id, m.name || m.email);
                      }
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default AddMechanic;
