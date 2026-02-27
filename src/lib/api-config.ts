// Use an absolute URL if explicitly provided, else default to relative '/api'
// This ensures cross-device compatibility when frontend & backend share the same origin.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
export const getApiUrl = (endpoint: string) => {
    // Ensure endpoint doesn't start with / to avoid double slash if needed
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    // If API_BASE_URL already contains /api, we handle it
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

    return `${baseUrl}/${cleanEndpoint}`;
};
