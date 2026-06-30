import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Supabase access token to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Handle 401 — Supabase handles token refresh automatically
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refreshing session once
      const { data } = await supabase.auth.refreshSession();
      if (data?.session) {
        error.config.headers.Authorization = `Bearer ${data.session.access_token}`;
        return api(error.config);
      }
      // If refresh fails, redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
