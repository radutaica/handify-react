import apiClient from './client';

/**
 * Reviews API for review management
 */
export const reviewsApi = {
  /**
   * Get reviews with filters
   * @param {Object} params - Query parameters
   * @param {string} params.reviewee_id - Filter by reviewee
   * @param {string} params.reviewer_id - Filter by reviewer
   * @param {string} params.task_id - Filter by task
   * @param {boolean} params.public_only - Only public reviews
   * @param {number} params.page - Page number
   * @param {number} params.per_page - Items per page
   */
  getReviews: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.reviewee_id) queryParams.append('reviewee_id', params.reviewee_id);
    if (params.reviewer_id) queryParams.append('reviewer_id', params.reviewer_id);
    if (params.task_id) queryParams.append('task_id', params.task_id);
    if (params.public_only) queryParams.append('public_only', 'true');
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);

    const queryString = queryParams.toString();
    const url = `/api/v1/reviews${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(url);
  },

  /**
   * Submit a new review
   * @param {Object} data - Review data
   * @param {string} data.task_id - Task ID
   * @param {number} data.rating - Rating 1-5
   * @param {string} data.comment - Review comment
   * @param {string[]} data.tags - Tags array
   */
  submitReview: async (data) => {
    return apiClient.post('/api/v1/reviews', { review: data });
  },
};

export default reviewsApi;
