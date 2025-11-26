import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      const token = userData.token || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors dan redirect jika unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect ke login
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;


