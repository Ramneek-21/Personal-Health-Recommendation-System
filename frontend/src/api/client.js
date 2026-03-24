const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8000/api/v1" : "/api/v1");
const UNAUTHORIZED_EVENT = "pulsepilot:unauthorized";

function normalizeErrorMessage(detail) {
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || "Invalid input").join(" ");
  }
  if (typeof detail === "string") {
    return detail;
  }
  return "Request failed";
}

async function request(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401 && token && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(UNAUTHORIZED_EVENT, {
          detail: { path, message: normalizeErrorMessage(data?.detail) },
        })
      );
    }
    const error = new Error(normalizeErrorMessage(data?.detail));
    error.status = response.status;
    throw error;
  }

  return data;
}

export const authApi = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: (token) => request("/auth/me", { token }),
};

export const profileApi = {
  get: (token) => request("/profile", { token }),
  upsert: (token, payload) => request("/profile", { method: "PUT", token, body: payload }),
};

export const logsApi = {
  list: (token) => request("/logs", { token }),
  create: (token, payload) => request("/logs", { method: "POST", token, body: payload }),
  weekly: (token) => request("/logs/weekly", { token }),
};

export const recommendationsApi = {
  latest: (token) => request("/recommendations/latest", { token }),
  generate: (token) => request("/recommendations/generate", { method: "POST", token }),
};

export const dashboardApi = {
  summary: (token) => request("/dashboard/summary", { token }),
  trends: (token) => request("/dashboard/trends", { token }),
};

export const habitsApi = {
  list: (token) => request("/habits", { token }),
  check: (token, payload) => request("/habits/check", { method: "POST", token, body: payload }),
};

export const notificationsApi = {
  list: (token) => request("/notifications", { token }),
  createReminder: (token, payload) =>
    request("/notifications/reminders", { method: "POST", token, body: payload }),
  markRead: (token, notificationId) =>
    request(`/notifications/${notificationId}/read`, { method: "POST", token }),
};

export { UNAUTHORIZED_EVENT };
