import apiClient from "./client";

export const oauthApi = {
  /**
   * Authenticate with a social provider
   * @param {string} provider - 'google_oauth2' or 'apple'
   * @param {string} token - Provider's ID/identity token
   * @param {object} userData - { email, first_name, last_name, profile_image_url }
   */
  socialSignIn: async (provider, token, userData = {}) => {
    return apiClient.post("/api/v1/auth/oauth", {
      provider,
      token,
      ...userData,
    });
  },
};

export default oauthApi;
