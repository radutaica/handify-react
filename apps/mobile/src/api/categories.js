import apiClient from './client';

/**
 * Categories API
 */
export const categoriesApi = {
  /**
   * Get categories with optional filtering
   */
  getCategories: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.active !== undefined) queryParams.append('active', params.active);
    if (params.withServices) queryParams.append('with_services', 'true');

    const queryString = queryParams.toString();
    const endpoint = `/api/categories${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(endpoint);
  },

  /**
   * Get a single category by ID
   */
  getCategory: async (id) => {
    return apiClient.get(`/api/categories/${id}`);
  },

  /**
   * Create a new category
   */
  createCategory: async (categoryData) => {
    return apiClient.post('/api/categories', categoryData);
  },

  /**
   * Update a category
   */
  updateCategory: async (id, categoryData) => {
    return apiClient.put(`/api/categories/${id}`, categoryData);
  },

  /**
   * Delete a category
   */
  deleteCategory: async (id) => {
    return apiClient.delete(`/api/categories/${id}`);
  },
};

export default categoriesApi;

