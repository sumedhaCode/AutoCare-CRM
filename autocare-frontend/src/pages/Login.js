// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { api } from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');

  const navigate = useNavigate();

  const GMAIL_REGEX = /^[a-z0-9._]+@gmail\.com$/;

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    if (!GMAIL_REGEX.test(email)) {
      setFormError(
        "Please enter a valid Gmail address (e.g. name@gmail.com)"
      );
      return;
    }

    setFormError('');

    try {
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      const { token, user } = response.data || {};

      if (!token) {
        setMessage('Login failed: No token received ❌');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('email', email);

      let decoded = {};
      try {
        decoded = jwtDecode(token);
      } catch {
        decoded = {};
      }

      // ✅ Robust role extraction
      let userRole = '';

      if (Array.isArray(decoded?.authorities)) {
        const firstAuth = decoded.authorities[0];
        userRole =
          typeof firstAuth === 'string'
            ? firstAuth
            : firstAuth?.authority || '';
      } else {
        userRole = decoded?.role || user?.role || '';
      }

      if (!userRole && user?.role) {
        userRole = user.role;
      }

      const chosenName =
        user?.name ||
        user?.fullName ||
        decoded?.name ||
        decoded?.email ||
        email;

      const userObj = {
        name: chosenName,
        email: user?.email || decoded?.email || email,
        role: userRole,
        _raw: user || decoded
      };

      localStorage.setItem('role', userRole);
      localStorage.setItem('name', userObj.name);
      localStorage.setItem('user', JSON.stringify(userObj));

      setMessage('Login successful 🎉');

      // ✅ Deterministic redirect
      if (userRole === 'ROLE_SUPER_ADMIN') {
        navigate('/superadmin');
      } else if (userRole === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else if (
        userRole === 'ROLE_MECHANIC' ||
        userRole === 'ROLE_STAFF' ||
        userRole === 'ROLE_MECHANIC_STAFF'
      ) {
        navigate('/staff/dashboard');
      } else {
        navigate('/user/dashboard');
      }

    } catch (error) {
      const backendMessage = error.response?.data;

      if (backendMessage && typeof backendMessage === 'string') {
        setMessage(backendMessage + ' ❌');
      } else if (error.response) {
        setMessage('Login failed. Please try again ❌');
      } else {
        setMessage('Login failed: Network error ❌');
      }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: '#eaf6fb' }}
    >
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-700 rounded-xl w-16 h-16 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M16 21v-2a4 4 0 00-8 0v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1 text-center">
            Welcome to AutoFlow
          </h2>
          <p className="text-gray-500 text-center mb-2">
            Sign in to your account
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white rounded-xl shadow-lg px-8 py-8 space-y-6"
        >
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              className="pl-4 pr-4 py-3 rounded-lg bg-[#f3f4f6] border w-full"
              placeholder="name@gmail.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-4 pr-4 py-3 rounded-lg bg-[#f3f4f6] border w-full"
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="text-sm text-blue-600 mt-1"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {formError && (
            <p className="text-red-500 text-sm text-center">{formError}</p>
          )}

          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg w-full"
          >
            Sign In
          </button>
        </form>

        {message && (
          <p
            className={`mt-6 text-center font-medium ${
              message.includes('successful')
                ? 'text-green-600'
                : 'text-red-500'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
