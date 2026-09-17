import axios from 'axios';
import { API_URL } from '../constants/api';
import { getStoredToken } from '../storage/authStorage';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error or server un-reachable
      return Promise.reject({
        message: 'Unable to connect to EventHub. Check your connection and try again.',
        isNetworkError: true,
      });
    }

    const resData = error.response.data;
    const formattedError = {
      message: resData?.message || 'An unexpected error occurred.',
      errors: resData?.errors || null,
      status: error.response.status,
    };
    return Promise.reject(formattedError);
  }
);

export default api;
