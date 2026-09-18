import axios from 'axios';

// ==============================
// AXIOS INSTANCE
// ==============================
const API_BASE =
  process.env.REACT_APP_API_BASE || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==============================
// Attach JWT token automatically
// ==============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==============================
// AUTH / CURRENT USER
// ==============================
export const getMe = () => api.get('/api/users/me');

// new 1
// ==============================
// AUTH — REGISTER
// ==============================
export const registerUser = (payload) =>
  api.post('/api/auth/register', payload);



// ==============================
// USERS (ADMIN)
// ==============================
export const getUsers = () => api.get('/api/users');

// ==============================
// MECHANICS (ADMIN)
// ==============================
export const getMechanics = () => api.get('/api/mechanics');

// ==============================
// SERVICES
// ==============================
export const getServices = () => api.get('/api/services');

// ==============================
// VEHICLES
// ==============================
export const getMyVehicles = () => api.get('/api/vehicles/me');

export const getUserVehicles = (userId) =>
  api.get(`/api/vehicles/user/${userId}`);

// ==============================
// BOOKINGS (USER)
// ==============================
export const createUserBooking = (payload) =>
  api.post('/api/bookings', payload);

// new 1
export const createUserSimpleBooking = (payload) =>
  api.post('/api/bookings/me', payload);


export const getMyBookings = () => api.get('/api/bookings/me');

// ==============================
// BOOKINGS (ADMIN)
// ==============================
export const createAdminBooking = (payload) =>
  api.post('/api/admin/bookings', payload);

export const getAdminBookings = () =>
  api.get('/api/admin/bookings');

export const getAdminBookingSummary = () =>
  api.get('/api/admin/bookings/summary');

export const assignMechanicToBooking = (bookingId, mechanicId) =>
  api.put(`/api/admin/bookings/${bookingId}/assign-mechanic`, {
    mechanicId,
  });

// ==============================
// TASKS / STAFF
// ==============================
export const getStaffTasks = () => api.get('/api/staff/tasks');

export const createTaskForBooking = (bookingId, mechanicId) =>
  api.post('/api/admin/tasks', { bookingId, mechanicId });

// ==============================
// ADMIN REPORTS  
// ==============================
export const getAdminReportSummary = (params = {}) =>
  api.get('/api/admin/reports/summary', { params });

export const getMechanicReports = (params = {}) =>
  api.get('/api/admin/reports/mechanics', { params });

export const getCustomerReports = (params = {}) =>
  api.get('/api/admin/reports/customers', { params });

// ==============================
// ADMIN — BOOKING CHARGES
// ==============================
export const updateBookingCharges = (bookingId, charges) =>
  api.put(`/api/admin/bookings/${bookingId}/charges`, { charges });