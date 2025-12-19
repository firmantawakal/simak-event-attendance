// Centralized configuration for API endpoints and URLs

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// API Configuration - supports cross-subdomain setup
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://event-api.unidumdev.my.id';

// Socket.io Configuration - use the same base as API for cross-subdomain
export const SOCKET_BASE_URL = process.env.REACT_APP_SOCKET_URL || (() => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://event-api.unidumdev.my.id';
  return apiUrl.replace('/api', '');
})();

export const APP_BASE_URL = process.env.REACT_APP_BASE_URL || '';
export const APP_ENV = process.env.REACT_APP_ENV || 'development';

// Build URLs dynamically for cross-subdomain setup
export const buildApiUrl = (endpoint) => {
  // Always use the full API URL for cross-subdomain requests
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

export const buildSocketUrl = () => {
  // Always use the full Socket.io URL for cross-subdomain
  return SOCKET_BASE_URL;
};

console.log('🔧 App Configuration:', {
  apiBaseUrl: API_BASE_URL,
  socketBaseUrl: SOCKET_BASE_URL,
  appEnv: APP_ENV,
  appBaseUrl: APP_BASE_URL
});