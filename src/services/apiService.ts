// API Service - Centralized API functions
// This file provides reusable API functions for different components

import { API_URLS, API_CONFIG, getStandardHeaders } from '../config/api';

// Generic API fetch function with error handling
export async function apiRequest<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const defaultOptions: RequestInit = {
    method: API_CONFIG.OPTIONS.METHOD.GET,
    headers: getStandardHeaders(),
    cache: API_CONFIG.OPTIONS.CACHE,
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, finalOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Request failed for ${url}:`, error);
    throw error;
  }
}

// Specific API functions
export const vulnerabilityApi = {
  // Get all vulnerabilities
  getAll: () => apiRequest(API_URLS.VULNERABILITIES),
  
  // Get vulnerabilities with custom parameters
  getWithParams: (params: Record<string, string>) => {
    const url = new URL(API_URLS.VULNERABILITIES);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    return apiRequest(url.toString());
  },
};

// You can add more API modules here
// export const userApi = {
//   getUser: (id: string) => apiRequest(`${API_CONFIG.BASE_URL}/users/${id}`),
//   updateUser: (id: string, data: any) => apiRequest(
//     `${API_CONFIG.BASE_URL}/users/${id}`, 
//     {
//       method: API_CONFIG.OPTIONS.METHOD.PUT,
//       body: JSON.stringify(data),
//     }
//   ),
// };
