import apiClient from './client';

/**
 * Tasks API for task management
 */
export const tasksApi = {
  /**
   * Get tasks for the current tasker
   * @param {Object} params - Query parameters
   * @param {string} params.assigned_tasker_id - Filter by tasker ID
   * @param {string} params.status - Filter by status (supports comma-separated: "open,assigned,in_progress")
   * @param {number} params.page - Page number for pagination
   * @param {number} params.per_page - Items per page
   */
  getTaskerTasks: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.assigned_tasker_id) {
      queryParams.append('assigned_tasker_id', params.assigned_tasker_id);
    }
    if (params.status) {
      queryParams.append('status', params.status);
    }
    if (params.page) {
      queryParams.append('page', params.page);
    }
    if (params.per_page) {
      queryParams.append('per_page', params.per_page);
    }

    const queryString = queryParams.toString();
    const url = `/api/v1/tasks${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(url);
  },

  /**
   * Get tasks for the current customer
   * @param {Object} params - Query parameters
   * @param {string} params.customer_id - Filter by customer ID
   * @param {string} params.status - Filter by status (supports comma-separated: "open,assigned,in_progress")
   * @param {number} params.page - Page number for pagination
   * @param {number} params.per_page - Items per page
   */
  getCustomerTasks: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.customer_id) {
      queryParams.append('customer_id', params.customer_id);
    }
    if (params.status) {
      queryParams.append('status', params.status);
    }
    if (params.page) {
      queryParams.append('page', params.page);
    }
    if (params.per_page) {
      queryParams.append('per_page', params.per_page);
    }

    const queryString = queryParams.toString();
    const url = `/api/v1/tasks${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(url);
  },

  /**
   * Get a single task by ID
   * @param {string} id - Task ID
   */
  getTask: async (id) => {
    return apiClient.get(`/api/v1/tasks/${id}`);
  },

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   */
  createTask: async (taskData) => {
    return apiClient.post('/api/v1/tasks', { task: taskData });
  },

  /**
   * Update task status
   * @param {string} id - Task ID
   * @param {string} status - New status (in_progress, completed)
   */
  updateTaskStatus: async (id, status) => {
    return apiClient.patch(`/api/v1/tasks/${id}`, {
      task: { status },
    });
  },

  /**
   * Cancel a task
   * @param {string} id - Task ID
   * @param {string} reason - Cancellation reason
   */
  cancelTask: async (id, reason) => {
    return apiClient.patch(`/api/v1/tasks/${id}`, {
      task: { status: 'cancelled', cancellation_reason: reason },
    });
  },

  /**
   * Get open tasks available for bidding
   * @param {Object} params - Query parameters
   * @param {string} params.category_id - Filter by category
   * @param {string} params.city - Filter by city
   * @param {number} params.budget_min - Minimum budget
   * @param {number} params.budget_max - Maximum budget
   * @param {string} params.urgency - Filter by urgency (low, medium, high)
   * @param {string} params.sort - Sort field
   * @param {string} params.sort_direction - Sort direction (asc, desc)
   * @param {number} params.page - Page number
   * @param {number} params.per_page - Items per page
   */
  getOpenTasks: async (params = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('status', 'open');

    if (params.category_id) queryParams.append('category_id', params.category_id);
    if (params.city) queryParams.append('city', params.city);
    if (params.budget_min) queryParams.append('budget_min', params.budget_min);
    if (params.budget_max) queryParams.append('budget_max', params.budget_max);
    if (params.urgency) queryParams.append('urgency', params.urgency);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);

    return apiClient.get(`/api/v1/tasks?${queryParams.toString()}`);
  },
};

export default tasksApi;
