import apiClient from './client';

/**
 * Profile API
 */
export const profileApi = {
  /**
   * Get profile
   */
  getProfile: async () => {
    return apiClient.get('/api/profile/complete');
  },

  /**
   * Complete/Update profile
   */
  completeProfile: async (profileData) => {
    return apiClient.put('/api/profile/complete', profileData);
  },

  /**
   * Update profile
   */
  updateProfile: async (profileData) => {
    return apiClient.patch('/api/profile', profileData);
  },

  /**
   * Get user by ID
   */
  getUser: async (userId) => {
    return apiClient.get(`/api/users/${userId}`);
  },
};

export default profileApi;

