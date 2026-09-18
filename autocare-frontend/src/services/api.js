import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// existing interceptors stay untouched

export const getSuperAdminDashboard = () =>
  api.get("/super-admin/dashboard");

export const getAllAdmins = () =>
  api.get("/super-admin/admins");

export default api;
