import api from '../config/api';

const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.data) {
      // Save user data and token
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success && response.data.data) {
      // Save user data and token
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    if (response.data.success && response.data.data) {
      // Update user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'admin';
  }
};

export default authService;

