import apiClient from './client';

/**
 * Bookings API
 */
export const bookingsApi = {
  /**
   * Get bookings with optional filtering
   */
  getBookings: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.customerId) queryParams.append('customer_id', params.customerId);
    if (params.providerId) queryParams.append('provider_id', params.providerId);
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);

    const queryString = queryParams.toString();
    const endpoint = `/api/bookings${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(endpoint);
  },

  /**
   * Get a single booking by ID
   */
  getBooking: async (id) => {
    return apiClient.get(`/api/bookings/${id}`);
  },

  /**
   * Create a new booking
   */
  createBooking: async (bookingData) => {
    return apiClient.post('/api/bookings', bookingData);
  },

  /**
   * Update a booking
   */
  updateBooking: async (id, bookingData) => {
    return apiClient.put(`/api/bookings/${id}`, bookingData);
  },

  /**
   * Delete a booking
   */
  deleteBooking: async (id) => {
    return apiClient.delete(`/api/bookings/${id}`);
  },
};

export default bookingsApi;

