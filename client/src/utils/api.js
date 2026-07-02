import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true, // Crucial for HttpOnly cookies
  timeout: 10000, // 10-second timeout — prevent silent hangs
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration (401)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip retry logic for:
    // 1. Non-401 errors
    // 2. Already-retried requests
    // 3. Auth routes (login, register, refresh, logout)
    const isAuthRoute = originalRequest.url &&
      (originalRequest.url.includes('/api/auth/login') ||
       originalRequest.url.includes('/api/auth/register') ||
       originalRequest.url.includes('/api/auth/refresh') ||
       originalRequest.url.includes('/api/auth/logout'));

    if (!error.response || error.response.status !== 401 || originalRequest._retry || isAuthRoute) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/refresh',
        {},
        { withCredentials: true, timeout: 5000 }
      );

      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      processQueue(null, accessToken);
      isRefreshing = false;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth_logout'));
      return Promise.reject(refreshError);
    }
  }
);

export default api;
