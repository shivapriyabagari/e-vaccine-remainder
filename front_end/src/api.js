const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "vaccine_reminder_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function apiRequest(path, options = {}) {
  const headers = { Accept: "application/json", ...options.headers };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body === undefined
      ? undefined
      : JSON.stringify(options.body),
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.message || `Request failed (${response.status})`);
    error.details = payload;
    throw error;
  }
  return payload;
}
