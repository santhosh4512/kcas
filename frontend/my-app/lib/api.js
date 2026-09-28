import axios from 'axios';

export function getEffectiveApiUrl() {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('kcas_backend_url');
    if (customUrl) {
      return customUrl.replace(/\/+$/, '');
    }
  }

  let base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    if (typeof window !== 'undefined') {
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        base = '/api';
      } else {
        base = 'http://localhost:5001/api';
      }
    } else {
      base = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api';
    }
  }

  return base.replace(/\/+$/, '');
}

let API_BASE_URL = getEffectiveApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout to allow Render free tier wake-up
});

// Request interceptor to attach JWT & dynamic baseURL
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      config.baseURL = getEffectiveApiUrl();
      const token = localStorage.getItem('kcas_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401/expired sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login') &&
        window.location.pathname !== '/'
      ) {
        localStorage.removeItem('kcas_auth_token');
        localStorage.removeItem('kcas_user_data');
        window.location.href = '/login?sessionExpired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };

