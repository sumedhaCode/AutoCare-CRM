import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ===============================
  // ✅ FIX — allow mechanic role group
  // ===============================
  if (role) {
    if (role === 'ROLE_MECHANIC') {
      const allowedMechanicRoles = [
        'ROLE_MECHANIC',
        'ROLE_STAFF',
        'ROLE_MECHANIC_STAFF'
      ];

      if (!allowedMechanicRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
      }
    } else {
      if (userRole !== role) {
        return <Navigate to="/" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;
