import apiClient from './client';

/**
 * Tasker Profiles API
 */
export const taskerProfilesApi = {
  /**
   * Create a tasker profile via onboarding
   * @param {Object} data - Tasker profile data
   * @param {string} data.bio - Professional biography
   * @param {number} data.hourly_rate - Hourly rate
   * @param {number} data.experience_years - Years of experience
   * @param {boolean} data.allows_instant_booking - Allow instant booking
   * @param {number} data.instant_booking_buffer_hours - Buffer hours for instant booking
   * @param {string[]} data.category_ids - Array of category UUIDs
   * @param {string[]} data.skills - Array of skills
   * @param {Object} data.availability - Weekly availability schedule
   * @param {Object} data.address - Address object
   */
  createOnboarding: async (data) => {
    return apiClient.post('/api/v1/tasker_profiles/onboarding', {
      tasker_profile: data,
    });
  },

  /**
   * Get the current user's tasker profile
   */
  getMyProfile: async () => {
    return apiClient.get('/api/v1/tasker_profiles/me');
  },

  /**
   * Update the current user's tasker profile
   */
  updateMyProfile: async (data) => {
    return apiClient.patch('/api/v1/tasker_profiles/me', {
      tasker_profile: data,
    });
  },

  /**
   * Get a tasker profile by ID
   */
  getProfile: async (id) => {
    return apiClient.get(`/api/v1/tasker_profiles/${id}`);
  },
};

export default taskerProfilesApi;
