import apiClient from './client';

/**
 * Direct Requests API for managing tasker direct requests
 */
export const directRequestsApi = {
  /**
   * Get direct requests
   * @param {Object} params - Query parameters
   * @param {string} params.tasker_id - Filter by tasker
   * @param {string} params.status - Filter by status
   */
  getDirectRequests: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.tasker_id) queryParams.append('tasker_id', params.tasker_id);
    if (params.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = `/api/v1/direct_requests${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(url);
  },

  /**
   * Get a single direct request
   * @param {string} id - Direct request ID
   */
  getDirectRequest: async (id) => {
    return apiClient.get(`/api/v1/direct_requests/${id}`);
  },

  /**
   * Accept a direct request
   * @param {string} id - Direct request ID
   */
  acceptDirectRequest: async (id) => {
    return apiClient.post(`/api/v1/direct_requests/${id}/accept`);
  },

  /**
   * Reject a direct request
   * @param {string} id - Direct request ID
   */
  rejectDirectRequest: async (id) => {
    return apiClient.post(`/api/v1/direct_requests/${id}/reject`);
  },

  /**
   * Send a counter offer
   * @param {string} id - Direct request ID
   * @param {Object} data - Counter offer data
   * @param {number} data.amount - Counter offer amount
   * @param {string} data.message - Counter offer message
   */
  counterOffer: async (id, data) => {
    return apiClient.post(`/api/v1/direct_requests/${id}/counter_offer`, data);
  },
};

export default directRequestsApi;
