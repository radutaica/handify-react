import apiClient from './client';

/**
 * Availability API for managing tasker time slots
 */
export const availabilityApi = {
  /**
   * Get availability slots
   * @param {Object} params - Query parameters
   * @param {string} params.tasker_id - Filter by tasker
   * @param {string} params.date - Filter by date
   * @param {boolean} params.upcoming - Only upcoming slots
   * @param {boolean} params.available_only - Only available slots
   */
  getAvailability: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.tasker_id) queryParams.append('tasker_id', params.tasker_id);
    if (params.date) queryParams.append('date', params.date);
    if (params.upcoming) queryParams.append('upcoming', 'true');
    if (params.available_only) queryParams.append('available_only', 'true');

    const queryString = queryParams.toString();
    const url = `/api/v1/tasker_availabilities${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(url);
  },

  /**
   * Create an availability slot
   * @param {Object} data - Slot data
   */
  createSlot: async (data) => {
    return apiClient.post('/api/v1/tasker_availabilities', { tasker_availability: data });
  },

  /**
   * Update an availability slot
   * @param {string} id - Slot ID
   * @param {Object} data - Updated data
   */
  updateSlot: async (id, data) => {
    return apiClient.patch(`/api/v1/tasker_availabilities/${id}`, { tasker_availability: data });
  },

  /**
   * Delete an availability slot
   * @param {string} id - Slot ID
   */
  deleteSlot: async (id) => {
    return apiClient.delete(`/api/v1/tasker_availabilities/${id}`);
  },
};

export default availabilityApi;
