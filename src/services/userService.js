import api from '../config/api';

const userService = {
  // Admin: Get all users
  getAllUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data.data;
  },

  // Admin: Get single user
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  // Admin: Get user statistics
  getUserStatistics: async () => {
    const response = await api.get('/users/statistics');
    return response.data.data;
  },

  // Admin: Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data.data;
  },

  // Admin: Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default userService;


