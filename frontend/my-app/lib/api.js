import axios from 'axios';

let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  if (typeof window !== 'undefined') {
    // If running in browser on a deployed host (e.g. Vercel, custom domain)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      API_BASE_URL = '/api';
    } else {
      API_BASE_URL = 'http://localhost:5001/api';
    }
  } else {
    API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api';
  }
}

// Clean up trailing slashes
API_BASE_URL = API_BASE_URL.replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
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
