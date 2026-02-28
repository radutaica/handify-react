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

  /**
   * Create a bid on a task
   * @param {string} taskId - Task ID
   * @param {Object} data - Bid data
   * @param {number} data.amount - Bid amount
   * @param {number} data.estimated_hours - Estimated hours
   * @param {string} data.proposed_date - Proposed date
   * @param {string} data.proposed_time - Proposed time
   * @param {string} data.message - Bid message
   */
  createBid: async (taskId, data) => {
    return apiClient.post(`/api/v1/tasks/${taskId}/bids`, { bid: data });
  },

  /**
   * Withdraw a bid
   * @param {string} bidId - Bid ID
   */
  withdrawBid: async (bidId) => {
    return apiClient.post(`/api/v1/bids/${bidId}/withdraw`);
  },
};

export default bidsApi;
