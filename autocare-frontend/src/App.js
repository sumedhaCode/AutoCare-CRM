import React, { useEffect, useState } from 'react';
import ProtectedRoute from "./components/ProtectedRoute";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import { Toaster } from "react-hot-toast";

import BookingForm from './pages/BookingForm';
import BookingHistory from './pages/BookingHistory';
import Navbar from './components/Navbar';
import Login from './pages/Login';

import Register from './pages/Register';


import UpcomingBookings from './pages/UpcomingBookings';
import MechanicLoadChart from './pages/MechanicLoadChart';
import AdminDashboard from './pages/AdminDashboard';
import AdminViewBookings from './components/AdminViewBookings.jsx';
import AdminBookingForm from './pages/AdminBookingForm.jsx';
import AddMechanic from './pages/AddMechanic';

import MechanicDashboard from './pages/staff/MechanicDashboard';
import UserDashboard from './pages/UserDashboard';

import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import AdminManagement from './pages/superadmin/AdminManagement';
import SubscriptionBilling from './pages/superadmin/SubscriptionBilling';
import SuperAdminSubscriptions from './pages/SuperAdminSubscriptions';
import AnalyticsOverview from './pages/superadmin/AnalyticsOverview';
import NotificationsPanel from './pages/superadmin/NotificationsPanel';

import AdminServiceReports from './pages/admin/AdminServiceReports';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RenewalRequests from './pages/superadmin/RenewalRequests';
/* ===============================
   ✅ NEW — ROLE BASED HOME REDIRECT
   =============================== */
const RoleRedirect = () => {
  const role = localStorage.getItem('role');

  if (role === 'ROLE_SUPER_ADMIN') {
    return <Navigate to="/superadmin" replace />;
  }

  if (role === 'ROLE_ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (
    role === 'ROLE_MECHANIC' ||
    role === 'ROLE_STAFF' ||
    role === 'ROLE_MECHANIC_STAFF'
  ) {
    return <Navigate to="/staff/dashboard" replace />;
  }

  return <Navigate to="/user/dashboard" replace />;
};

// 🔁 Routes wrapper
const AppRoutes = () => {
  const location = useLocation();

  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
  });

  useEffect(() => {
    setAuth({
      token: localStorage.getItem('token'),
      role: localStorage.getItem('role'),
    });
  }, [location.pathname]);

  return (
    <>
      <Navbar token={auth.token} role={auth.role} />

      <Routes>
        <Route path="/login" element={<Login />} />

        // new 1
        <Route path="/register" element={<Register />} />


        {/* ✅ FIXED ROOT ROUTE */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoleRedirect />
            </ProtectedRoute>
          }
        />

        {/* USER */}
        <Route path="/booking-form" element={<ProtectedRoute><BookingForm /></ProtectedRoute>} />
        <Route path="/booking-history" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
        <Route path="/user/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/upcoming-bookings" element={<ProtectedRoute><UpcomingBookings /></ProtectedRoute>} />

        {/* ADMIN */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="ROLE_ADMIN"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/view-bookings" element={<ProtectedRoute role="ROLE_ADMIN"><AdminViewBookings /></ProtectedRoute>} />
        <Route path="/admin/book-service" element={<ProtectedRoute role="ROLE_ADMIN"><AdminBookingForm /></ProtectedRoute>} />
        <Route path="/admin/mechanic-load" element={<ProtectedRoute role="ROLE_ADMIN"><MechanicLoadChart /></ProtectedRoute>} />
        <Route path="/admin/add-mechanic" element={<ProtectedRoute role="ROLE_ADMIN"><AddMechanic /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute role="ROLE_ADMIN"><AdminServiceReports /></ProtectedRoute>} />

        {/* STAFF */}
        <Route path="/staff/dashboard" element={<ProtectedRoute role="ROLE_MECHANIC"><MechanicDashboard /></ProtectedRoute>} />

        {/* SUPER ADMIN */}
        <Route path="/superadmin" element={<ProtectedRoute role="ROLE_SUPER_ADMIN"><SuperAdminDashboard /></ProtectedRoute>}>
          <Route path="admins" element={<AdminManagement />} />
          <Route path="subscriptions" element={<SubscriptionBilling />} />
          <Route path="subscriptions/list" element={<SuperAdminSubscriptions />} />
          <Route path="analytics" element={<AnalyticsOverview />} />
          <Route path="notifications" element={<NotificationsPanel />} />
          {/* ✅ ADD THIS */}
  <Route path="renewal-requests" element={<RenewalRequests />} />
        </Route>

        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <>
      {/* ✅ react-hot-toast renderer (FIX) */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
        }}
      />

      {/* react-toastify (can stay, no harm) */}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  );
}


export default App;
