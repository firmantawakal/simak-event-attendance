// Centralized configuration for API endpoints and URLs

// Detect if we're in production and use relative URLs to avoid CORS issues
const isProduction = process.env.NODE_ENV === 'production';

// In production, use relative URLs to avoid CORS issues when accessing from different IPs
export const API_BASE_URL = isProduction ? '/api' : (process.env.REACT_APP_API_URL || 'http://localhost:5001/api');

export const SOCKET_BASE_URL = isProduction ? '' : (() => {
  // Extract base URL from REACT_APP_API_URL by removing /api suffix
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
  return apiUrl.replace('/api', '');
})();

export const APP_BASE_URL = process.env.REACT_APP_BASE_URL || '';
export const APP_ENV = process.env.REACT_APP_ENV || 'development';

// Build URLs dynamically
export const buildApiUrl = (endpoint) => {
  if (isProduction) {
    // In production, use relative URLs
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `/api/${cleanEndpoint}`;
  } else {
    // In development, use full URLs
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${baseUrl}/${cleanEndpoint}`;
  }
};

export const buildSocketUrl = () => {
  return SOCKET_BASE_URL;
};

console.log('🔧 App Configuration:', {
  apiBaseUrl: API_BASE_URL,
  socketBaseUrl: SOCKET_BASE_URL,
  appEnv: APP_ENV,
  appBaseUrl: APP_BASE_URL
});