import apiClient from './client';

/**
 * Disputes API for managing task disputes
 */
export const disputesApi = {
  /**
   * Get disputes
   */
  getDisputes: async () => {
    return apiClient.get('/api/v1/disputes');
  },

  /**
   * Create a dispute
   * @param {Object} data - Dispute data
   * @param {string} data.task_id - Task ID
   * @param {string} data.reason - Dispute reason
   */
  createDispute: async (data) => {
    return apiClient.post('/api/v1/disputes', { dispute: data });
  },
};

export default disputesApi;
