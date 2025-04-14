import { logApiRequest, logApiResponse, logApiError } from "../utils/logger";

// Get authorization header with token
export function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Handle API responses
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || response.statusText;
    throw new Error(errorMessage);
  }
  if (response.status === 204) return true as T;
  return response.json() as Promise<T>;
}

// Build query string from parameters
export function buildQueryString(params: Record<string, any>): string {
  const validParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");

  return validParams ? `?${validParams}` : "";
}

// Make API request
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const method = options.method || "GET";
  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const authHeader = getAuthHeader();
  const finalHeaders = {
    ...baseHeaders,
    ...authHeader,
    ...(options.headers || {}),
  };

  // Log the API request
  logApiRequest(
    method,
    url,
    finalHeaders,
    options.body
      ? typeof options.body === "string"
        ? JSON.parse(options.body)
        : options.body
      : undefined
  );

  const startTime = performance.now();
  let responseData;

  try {
    const response = await fetch(url, {
      ...options,
      headers: finalHeaders,
    });
    if (response.status === 200) {
      responseData = await response
        .clone()
        .json()
        .catch(() => null);
    } else if (response.status === 204) {
      responseData = true;
    }

    // Log the API response
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    logApiResponse(method, url, response.status, responseData, duration);

    // Process the response
    return handleApiResponse<T>(response);
  } catch (error) {
    // Log the API error
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    logApiError(method, url, error, duration);
    throw error;
  }
}
