const API_URL = "http://localhost:5000/api";

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
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  if (
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // Token missing, invalid, or expired
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";

    throw new Error(
      data?.message || "Your session has expired."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message || "Something went wrong."
    );
  }

  return data;
};