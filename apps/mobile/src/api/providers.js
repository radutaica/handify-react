import apiClient from './client';

/**
 * Providers (Tasker Profiles) API
 */
export const providersApi = {
  /**
   * Get providers with optional filtering, sorting, and pagination
   */
  getProviders: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.q) queryParams.append('q', params.q);
    if (params.categoryId) queryParams.append('category_id', params.categoryId);
    if (params.activeOnly) queryParams.append('active_only', 'true');
    if (params.highRated) queryParams.append('high_rated', 'true');
    if (params.minRating) queryParams.append('min_rating', params.minRating);
    if (params.minRate) queryParams.append('min_rate', params.minRate);
    if (params.maxRate) queryParams.append('max_rate', params.maxRate);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.page) queryParams.append('page', params.page);
    if (params.perPage) queryParams.append('per_page', params.perPage);

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/tasker_profiles${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(endpoint);
  },

  /**
   * Get a single provider by ID
   */
  getProvider: async (id) => {
    return apiClient.get(`/api/v1/tasker_profiles/${id}`);
  },

  /**
   * Get portfolio items for a provider (by user ID)
   */
  getPortfolio: async (userId, params = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('tasker_id', userId);

    if (params.categoryId) queryParams.append('category_id', params.categoryId);
    if (params.featuredOnly) queryParams.append('featured_only', 'true');

    return apiClient.get(`/api/v1/portfolio_items?${queryParams.toString()}`);
  },

  /**
   * Get reviews for a provider (by user ID)
   */
  getReviews: async (userId, params = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('reviewee_id', userId);
    queryParams.append('public_only', 'true');

    if (params.highRated) queryParams.append('high_rated', 'true');
    if (params.page) queryParams.append('page', params.page);
    if (params.perPage) queryParams.append('per_page', params.perPage);

    return apiClient.get(`/api/v1/reviews?${queryParams.toString()}`);
  },
};

export default providersApi;
