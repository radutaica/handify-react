import apiClient from './client';

/**
 * Addresses API
 */
export const addressesApi = {
  /**
   * Get addresses for the current user
   */
  getAddresses: async () => {
    return apiClient.get('/api/v1/addresses');
  },

  /**
   * Create a new address
   * @param {Object} addressData - Address data
   * @param {string} addressData.street_address - Street address
   * @param {string} addressData.city - City
   * @param {string} addressData.county - County/state
   * @param {string} addressData.postal_code - Postal code
   * @param {string} addressData.country - Country code (e.g. "RO")
   * @param {string} addressData.label - Optional label
   */
  createAddress: async (addressData) => {
    return apiClient.post('/api/v1/addresses', { address: addressData });
  },
};

export default addressesApi;
