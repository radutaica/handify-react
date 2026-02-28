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
   * Request: { profileData: { photo_url, preferred_language, email_notifications, sms_notifications, push_notifications, user_type, location_address, location_city, location_zip, payment_method, service_categories: [], preferred_time_windows: [] } }
   * Response: { status: { code: 200, message: 'Profile updated successfully.' }, data: { ...user } }
   */
  completeProfile: async (profileData) => {
    // Wrap data in profileData key to match Rails backend expectations
    // Rails expects: params.require(:profileData).permit(...)
    return apiClient.post('/api/v1/user_profiles/complete', {
      profileData: profileData
    });
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

  /**
   * Get current authenticated user with tasker profile
   * Response: { status: { code: 200, message: '...' }, data: { ...user, tasker_profile?: {...} } }
   */
  getCurrentUser: async () => {
    return apiClient.get('/api/v1/me');
  },
};

export default profileApi;

