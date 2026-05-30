import axios from "axios";

function resolveApiBaseUrl(rawValue) {
  if (!rawValue) {
    return "http://localhost:8000";
  }

  try {
    const parsed = new URL(rawValue);
    if (parsed.hostname === "backend" && typeof window !== "undefined") {
      parsed.hostname = window.location.hostname || "localhost";
      return parsed.toString().replace(/\/$/, "");
    }
    return rawValue.replace(/\/$/, "");
  } catch {
    return rawValue.replace(/\/$/, "");
  }
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(import.meta.env.VITE_API_URL),
  headers: {
    "Content-Type": "application/json",
  },
});

export function extractApiError(error, fallbackMessage) {
  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }

  if (error?.message) {
    return error.message;
  }

  return fallbackMessage;
}

export default api;
