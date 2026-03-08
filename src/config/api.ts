/**
 * API Configuration
 * Update this with your deployed backend URL
 */

// For local development
// export const API_BASE_URL = 'http://192.168.31.205:8000';

// For production (Render deployment)
// Replace with your actual Render URL after deployment
export const API_BASE_URL = 'https://krishisakhi-n4zi.onrender.com';

// API Endpoints
export const API_ENDPOINTS = {
  // Health & Status
  health: `${API_BASE_URL}/health`,

  // Climate Simulation
  climateSimulate: `${API_BASE_URL}/api/climate/simulate`,

  // Intelligence Endpoints
  weather: `${API_BASE_URL}/api/intelligence/weather`,
  cropRotation: `${API_BASE_URL}/api/intelligence/crop-rotation`,
  schemes: `${API_BASE_URL}/api/intelligence/schemes`,
  mentors: `${API_BASE_URL}/api/intelligence/mentors`,
  market: `${API_BASE_URL}/api/intelligence/market`,
  chat: `${API_BASE_URL}/api/intelligence/chat`,

  // Analytics
  analyticsDashboard: `${API_BASE_URL}/api/analytics/dashboard`,
  profitability: `${API_BASE_URL}/api/analytics/profitability`,
  riskAssessment: `${API_BASE_URL}/api/analytics/risk-assessment`,
};

/**
 * Helper function to make API calls with error handling
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('API call failed:', error);
    throw error;
  }
}

