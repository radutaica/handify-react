import axios from 'axios';
import apiClient from './client';

/**
 * Auth API - Rails Devise endpoints using Axios
 * 
 * Routes:
 * - POST /users/sign_in - Sign in
 * - POST /users - Sign up
 * - DELETE /users/sign_out - Sign out
 */
export const authApi = {
  /**
   * Sign in (POST /users/sign_in)
   * Request: { user: { email, password } }
   * Response: { status: { code: 200, message: 'Logged in successfully.' }, data: { ...user }, jwt: <token> }
   * JWT token is in the response body (generated using Warden::JWTAuth::UserEncoder)
   */
  signIn: async (email, password) => {
    const url = apiClient.buildURL('/users/sign_in');
    
    try {
      // Use axios directly to access response body for JWT token
      const response = await axios.post(url, {
        user: { email, password }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      // Extract JWT token from response body
      // The token is generated using Warden::JWTAuth::UserEncoder and sent in the response body
      const responseData = response.data;
      
      // Extract JWT token from response body first (primary source)
      // Check common locations: jwt, token, data.jwt, data.token
      let jwt = responseData?.jwt || 
                responseData?.token ||
                responseData?.data?.jwt ||
                responseData?.data?.token ||
                null;

      // Also check Authorization header as fallback (in case server sends it both ways)
      if (!jwt && response.headers) {
        const authHeader = response.headers['authorization'] || 
                          response.headers['Authorization'] ||
                          response.headers['AUTHORIZATION'];
        
        if (authHeader) {
          jwt = authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : authHeader.startsWith('bearer ')
            ? authHeader.substring(7)
            : authHeader;
        }
      }

      if (!jwt) {
        console.error('❌ No JWT token found in response body or headers');
        console.error('Response data:', JSON.stringify(responseData, null, 2));
      } else {
        console.log('✅ JWT token extracted successfully from response body');
      }

      // Response body includes user data (via UserSerializer)
      const user = responseData?.data || responseData?.user || responseData;

      return {
        success: true,
        jwt: jwt,
        user: user,
        message: response.data?.status?.message || 'Logged in successfully.',
      };
    } catch (error) {
      // Handle Rails/Devise error format
      if (error.response) {
        const data = error.response.data;
        const errorMessage = data?.status?.message || 
                            data?.error || 
                            data?.message || 
                            error.message ||
                            `HTTP error! status: ${error.response.status}`;
        
        return {
          success: false,
          error: errorMessage,
          status: error.response.status,
        };
      }
      
      throw error;
    }
  },

  /**
   * Sign up (POST /users)
   * Request: { user: { email, password, first_name, last_name, name } }
   * Response: { status: { code: 200, message: 'Signed up successfully.' }, data: { ...user }, jwt: <token> }
   * JWT token is in the response body (generated using Warden::JWTAuth::UserEncoder)
   * 
   * Authentication Flow:
   * - User creates an account via POST /users
   * - JWT token is generated using Warden::JWTAuth::UserEncoder (same as devise-jwt uses internally)
   * - The JWT token is sent in the response body
   * - The response body includes user data (via UserSerializer)
   * - After registration, the user is authenticated
   * - The client extracts the JWT token from the response body
   * - The client stores it (e.g., in SecureStore)
   * - The client can immediately use that token for authenticated requests as Authorization: Bearer <token>
   */
  signUp: async (userData) => {
    const { email, password, firstName, lastName, name } = userData;
    const url = apiClient.buildURL('/users');
    
    try {
      // Use axios directly to access response headers for JWT token
      // Note: For web browsers, the server must expose the Authorization header
      // via CORS: Access-Control-Expose-Headers: Authorization
      const response = await axios.post(url, {
        user: {
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          name: name || `${firstName} ${lastName}`,
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Ensure we can access all response headers
        validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      });

      // Extract JWT token from response body
      // The token is generated using Warden::JWTAuth::UserEncoder and sent in the response body
      const responseData = response.data;
      
      // Extract JWT token from response body first (primary source)
      // Check common locations: jwt, token, data.jwt, data.token
      let jwt = responseData?.jwt || 
                responseData?.token ||
                responseData?.data?.jwt ||
                responseData?.data?.token ||
                null;

      // Also check Authorization header as fallback (in case server sends it both ways)
      if (!jwt && response.headers) {
        const authHeader = response.headers['authorization'] || 
                          response.headers['Authorization'] ||
                          response.headers['AUTHORIZATION'];
        
        if (authHeader) {
          jwt = authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : authHeader.startsWith('bearer ')
            ? authHeader.substring(7)
            : authHeader;
        }
      }

      if (!jwt) {
        console.error('❌ No JWT token found in response body or headers');
        console.error('Response data:', JSON.stringify(responseData, null, 2));
      } else {
        console.log('✅ JWT token extracted successfully from response body');
      }

      // Response body includes user data (via UserSerializer)
      const user = responseData?.data || responseData?.user || responseData;

      return {
        success: true,
        jwt: jwt,
        user: user,
        message: response.data?.status?.message || 'Signed up successfully.',
      };
    } catch (error) {
      // Handle Rails/Devise error format
      if (error.response) {
        const data = error.response.data;
        const errorMessage = data?.status?.message || 
                            data?.error || 
                            data?.message || 
                            error.message ||
                            `HTTP error! status: ${error.response.status}`;
        
        return {
          success: false,
          error: errorMessage,
          status: error.response.status,
        };
      }
      
      throw error;
    }
  },

  /**
   * Sign out (DELETE /users/sign_out)
   * Response: { status: 200, message: 'Logged out successfully.' }
   */
  signOut: async () => {
    return apiClient.delete('/users/sign_out');
  },

  /**
   * Forgot password (POST /users/password)
   * Request: { user: { email } }
   */
  forgotPassword: async (email) => {
    return apiClient.post('/users/password', { 
      user: { email } 
    });
  },
};

export default authApi;
