import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Base API client using Axios
 */
class ApiClient {
  constructor(baseURL = BASE_URL) {
    this.baseURL = baseURL;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Handle Rails/Devise error format
        if (error.response) {
          const data = error.response.data;
          const errorMessage = data?.status?.message || 
                              data?.error || 
                              data?.message || 
                              error.message ||
                              `HTTP error! status: ${error.response.status}`;
          const customError = new Error(errorMessage);
          customError.status = error.response.status;
          customError.data = data;
          return Promise.reject(customError);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get auth token from storage
   */
  async getAuthToken() {
    try {
      // Try to get from Zustand store first
      const { useAuthStore } = await import('@/utils/auth/store');
      const state = useAuthStore.getState();
      if (state?.auth?.jwt) {
        return state.auth.jwt;
      }
      
      // Fallback to SecureStore if not in memory
      const SecureStore = await import('expo-secure-store');
      const authKey = `${process.env.EXPO_PUBLIC_PROJECT_GROUP_ID}-jwt`;
      const stored = await SecureStore.getItemAsync(authKey);
      if (stored) {
        const auth = JSON.parse(stored);
        return auth?.jwt || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Build full URL from endpoint
   * Made public so auth API can access it
   */
  buildURL(endpoint) {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    const base = this.baseURL.replace(/\/$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }

  /**
   * Get axios instance (for direct access if needed)
   */
  getAxiosInstance() {
    return this.axiosInstance;
  }

  /**
   * GET request
   */
  async get(endpoint, config = {}) {
    const response = await this.axiosInstance.get(endpoint, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post(endpoint, data, config = {}) {
    const response = await this.axiosInstance.post(endpoint, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put(endpoint, data, config = {}) {
    const response = await this.axiosInstance.put(endpoint, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data, config = {}) {
    const response = await this.axiosInstance.patch(endpoint, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete(endpoint, config = {}) {
    const response = await this.axiosInstance.delete(endpoint, config);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
