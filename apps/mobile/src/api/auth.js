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
   * Response: { status: { code: 200, message: 'Logged in successfully.' }, data: { ...user } }
   * JWT token is in Authorization header (handled by devise-jwt)
   */
  signIn: async (email, password) => {
    const url = apiClient.buildURL('/users/sign_in');
    
    // Use axios directly to access response headers for JWT token
    const response = await axios.post(url, {
      user: { email, password }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Extract JWT from Authorization header (devise-jwt)
    const authHeader = response.headers['authorization'] || response.headers['Authorization'];
    const jwt = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    return {
      success: true,
      jwt: jwt,
      user: response.data.data,
      message: response.data.status?.message,
    };
  },

  /**
   * Sign up (POST /users)
   * Request: { user: { email, password, first_name, last_name, name } }
   * Response: { status: { code: 200, message: 'Signed up successfully.' }, data: { ...user } }
   * JWT token is in Authorization header (handled by devise-jwt)
   */
  signUp: async (userData) => {
    const { email, password, firstName, lastName, name } = userData;
    const url = apiClient.buildURL('/users');
    
    // Use axios directly to access response headers for JWT token
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
    });

    // Extract JWT from Authorization header (devise-jwt)
    const authHeader = response.headers['authorization'] || response.headers['Authorization'];
    const jwt = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    return {
      success: true,
      jwt: jwt,
      user: response.data.data,
      message: response.data.status?.message,
    };
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
