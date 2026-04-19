import apiClient from './client';

/**
 * Messages API for messaging and conversations
 */
export const messagesApi = {
  /**
   * Get conversations list (grouped by task/direct_request)
   */
  getConversations: async () => {
    return apiClient.get('/api/v1/messages/conversations');
  },

  /**
   * Get messages for a conversation
   * @param {Object} params - Query parameters
   * @param {string} params.task_id - Filter by task ID
   * @param {string} params.direct_request_id - Filter by direct request ID
   * @param {string} params.created_after - ISO timestamp for polling (only messages after this time)
   * @param {number} params.page - Page number for pagination
   * @param {number} params.per_page - Items per page
   */
  getMessages: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.task_id) {
      queryParams.append('task_id', params.task_id);
    }
    if (params.direct_request_id) {
      queryParams.append('direct_request_id', params.direct_request_id);
    }
    if (params.created_after) {
      queryParams.append('created_after', params.created_after);
    }
    if (params.page) {
      queryParams.append('page', params.page);
    }
    if (params.per_page) {
      queryParams.append('per_page', params.per_page);
    }

    const queryString = queryParams.toString();
    const url = `/api/v1/messages${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(url);
  },

  /**
   * Send a new message
   * @param {Object} data - Message data
   * @param {string} data.task_id - Task ID (or direct_request_id)
   * @param {string} data.direct_request_id - Direct request ID
   * @param {string} data.receiver_id - Receiver user ID
   * @param {string} data.message - Message text
   */
  sendMessage: async (data) => {
    return apiClient.post('/api/v1/messages', { message: data });
  },

  /**
   * Mark a single message as read
   * @param {string} messageId - Message ID
   */
  markAsRead: async (messageId) => {
    return apiClient.post(`/api/v1/messages/${messageId}/mark_as_read`);
  },

  /**
   * Mark all messages in a conversation as read
   * @param {Object} params - Conversation identifier
   * @param {string} params.task_id - Task ID
   * @param {string} params.direct_request_id - Direct request ID
   */
  markAllAsRead: async (params) => {
    return apiClient.post('/api/v1/messages/mark_all_as_read', params);
  },
};

export default messagesApi;
