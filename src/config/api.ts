// API Configuration
// Update this file to change API endpoints across the entire application

export const API_CONFIG = {
  // Base URLs
  NGROK_BASE_URL: "https://7638440c97e7.ngrok-free.app",
  
  // API Endpoints
  ENDPOINTS: {
    VULNERABILITIES: "/vulnerabilities",
    // Add other endpoints here as needed
    // USERS: "/users",
    // AUTH: "/auth",
  },
  
  // Headers
  HEADERS: {
    NGROK_HEADERS: {
      "ngrok-skip-browser-warning": "true",
    },
    COMMON_HEADERS: {
      "Content-Type": "application/json",
    },
  },
  
  // Request Options
  OPTIONS: {
    CACHE: "no-store" as RequestCache,
    METHOD: {
      GET: "GET",
      POST: "POST",
      PUT: "PUT",
      DELETE: "DELETE",
    },
  },
} as const;

// Helper function to build full URLs
export const buildApiUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS): string => {
  return `${API_CONFIG.NGROK_BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
};

// Helper function to get standard headers
export const getStandardHeaders = (): Record<string, string> => {
  return {
    ...API_CONFIG.HEADERS.NGROK_HEADERS,
    ...API_CONFIG.HEADERS.COMMON_HEADERS,
  };
};

// Pre-built API URLs for easy access
export const API_URLS = {
  VULNERABILITIES: buildApiUrl("VULNERABILITIES"),
} as const;
