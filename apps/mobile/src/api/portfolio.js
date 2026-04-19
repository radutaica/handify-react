import apiClient from './client';

/**
 * Portfolio API for managing tasker portfolio items
 */
export const portfolioApi = {
  /**
   * Get portfolio items
   * @param {Object} params - Query parameters
   * @param {string} params.tasker_id - Filter by tasker
   * @param {string} params.category_id - Filter by category
   * @param {boolean} params.featured_only - Only featured items
   */
  getPortfolioItems: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.tasker_id) queryParams.append('tasker_id', params.tasker_id);
    if (params.category_id) queryParams.append('category_id', params.category_id);
    if (params.featured_only) queryParams.append('featured_only', 'true');

    const queryString = queryParams.toString();
    const url = `/api/v1/portfolio_items${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(url);
  },

  /**
   * Create a portfolio item
   * @param {Object} data - Portfolio item data
   */
  createPortfolioItem: async (data) => {
    return apiClient.post('/api/v1/portfolio_items', { portfolio_item: data });
  },

  /**
   * Update a portfolio item
   * @param {string} id - Portfolio item ID
   * @param {Object} data - Updated data
   */
  updatePortfolioItem: async (id, data) => {
    return apiClient.patch(`/api/v1/portfolio_items/${id}`, { portfolio_item: data });
  },

  /**
   * Delete a portfolio item
   * @param {string} id - Portfolio item ID
   */
  deletePortfolioItem: async (id) => {
    return apiClient.delete(`/api/v1/portfolio_items/${id}`);
  },
};

export default portfolioApi;
