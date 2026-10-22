import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const responseData = error.response?.data;
    const message = responseData?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject({
      status: error.response?.status,
      message,
      errors: responseData?.errors,
      originalError: error,
    });
  }
);

export default api;
