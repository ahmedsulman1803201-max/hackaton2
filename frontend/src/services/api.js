import axios from "axios";
import { getSessionUser } from "./storage";

const api = axios.create({
  // Vite proxies this path locally; VITE_API_URL supports deployed environments.
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = getSessionUser()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getApiError = (error, fallback = "Something went wrong. Please try again.") =>
  error.response?.data?.message || fallback;

// Upload paths are returned by the API as `/uploads/...`.  The frontend and
// API often run on different ports, so browser assets must use the API origin
// rather than the Vite application's origin.
export const getUploadUrl = (value) => {
  if (!value || value.startsWith("data:") || /^https?:\/\//i.test(value)) return value;
  const apiUrl = import.meta.env.VITE_API_URL || "";
  const apiOrigin = apiUrl.replace(/\/api\/?$/, "");
  return apiOrigin && value.startsWith("/") ? `${apiOrigin}${value}` : value;
};

export default api;
