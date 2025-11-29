import apiClient from './client';

/**
 * Services API
 */
export const servicesApi = {
  /**
   * Get services with optional filtering
   */
  getServices: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.categoryId) queryParams.append('category_id', params.categoryId);
    if (params.category) queryParams.append('category', params.category);
    if (params.active !== undefined) queryParams.append('active', params.active);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);

    const queryString = queryParams.toString();
    const endpoint = `/api/services${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(endpoint);
  },

  /**
   * Get a single service by ID
   */
  getService: async (id) => {
    return apiClient.get(`/api/services/${id}`);
  },

  /**
   * Create a new service
   */
  createService: async (serviceData) => {
    return apiClient.post('/api/services', serviceData);
  },

  /**
   * Update a service
   */
  updateService: async (id, serviceData) => {
    return apiClient.put(`/api/services/${id}`, serviceData);
  },

  /**
   * Delete a service
   */
  deleteService: async (id) => {
    return apiClient.delete(`/api/services/${id}`);
  },
};

export default servicesApi;

