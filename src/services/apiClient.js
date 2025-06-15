import axios from 'axios';
import { isTokenExpired, logout, getToken } from './authService';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Check token before request
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    if (token) {
      if (isTokenExpired(token)) {
        logout(); // Token expired, so logout
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle unauthorized responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is due to unauthorized or token expired
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
