import apiClient from './client';

/**
 * Bids API
 */
export const bidsApi = {
  /**
   * Get bids for a specific task
   * @param {string} taskId - Task ID
   */
  getTaskBids: async (taskId) => {
    return apiClient.get(`/api/v1/tasks/${taskId}/bids`);
  },

  /**
   * Accept a bid
   * @param {string} bidId - Bid ID
   */
  acceptBid: async (bidId) => {
    return apiClient.post(`/api/v1/bids/${bidId}/accept`);
  },
};

export default bidsApi;
