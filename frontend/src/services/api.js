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

export default api;
