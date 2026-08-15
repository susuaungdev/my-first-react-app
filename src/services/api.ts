const normalizeUrl = (value: string) => value.trim().replace(/\/+$/, "");

export const API_URL = normalizeUrl(
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
);

type ApiOptions = RequestInit & {
  body?: BodyInit | null;
};

export const apiRequest = async (
  endpoint: string,
  options: ApiOptions = {}
) => {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("Unable to connect to the server.");
  }

  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }

    throw new Error(data?.message || "Your session has expired.");
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}.`);
  }

  return data;
};