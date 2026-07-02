import { create } from 'zustand';
import api from '../utils/api.js';

export const useAuthStore = create((set, get) => {
  // Global event listener to catch logouts triggered by Axios interceptors
  if (typeof window !== 'undefined') {
    window.addEventListener('auth_logout', () => {
      set({ user: null, accessToken: null, error: null });
    });
  }

  // Load initial state from local storage safely
  let initialUser = null;
  try {
    const saved = localStorage.getItem('user');
    if (saved && saved !== 'undefined') {
      initialUser = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error parsing stored user data:', e);
  }

  const initialToken = localStorage.getItem('accessToken') || null;

  return {
    user: initialUser,
    accessToken: initialToken,
    loading: false,
    error: null,

    clearError: () => set({ error: null }),

    // Login Action
    login: async (email, password) => {
      set({ loading: true, error: null });
      try {
        const res = await api.post('/api/auth/login', { email, password });
        const { data, accessToken } = res.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(data));

        set({ user: data, accessToken, loading: false });
        return { success: true, user: data };
      } catch (err) {
        const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
        set({ error: msg, loading: false });
        return { success: false, message: msg };
      }
    },

    // Register Action
    register: async (userData) => {
      set({ loading: true, error: null });
      try {
        const res = await api.post('/api/auth/register', userData);
        const { data, accessToken } = res.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(data));

        set({ user: data, accessToken, loading: false });
        return { success: true, user: data };
      } catch (err) {
        const msg = err.response?.data?.message || 'Registration failed. Please try again.';
        set({ error: msg, loading: false });
        return { success: false, message: msg };
      }
    },

    // Logout Action
    logout: async () => {
      set({ loading: true });
      try {
        await api.post('/api/auth/logout');
      } catch (err) {
        console.error('Logout request failed:', err);
      } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        set({ user: null, accessToken: null, loading: false, error: null });
      }
    },

    // Check Auth details from token
    checkAuth: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ user: null, accessToken: null });
        return null;
      }

      try {
        const res = await api.get('/api/auth/me');
        const { data } = res.data;
        localStorage.setItem('user', JSON.stringify(data));
        set({ user: data, accessToken: token, loading: false });
        return data;
      } catch (err) {
        console.error('CheckAuth error:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        set({ user: null, accessToken: null, loading: false });
        return null;
      }
    }
  };
});
