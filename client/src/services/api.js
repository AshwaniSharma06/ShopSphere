import axios from 'axios';

const API_URL = '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopsphere-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Telemetry log for API request
    fetch('/api/v1/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'api_request', method: config.method?.toUpperCase(), url: config.url })
    }).catch(() => {});
    return config;
  },
  (error) => {
    fetch('/api/v1/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'api_request_error', message: error.message })
    }).catch(() => {});
    return Promise.reject(error);
  }
);

// Response interceptor — handle auth errors globally
api.interceptors.response.use(
  (response) => {
    fetch('/api/v1/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'api_response', method: response.config.method?.toUpperCase(), url: response.config.url, status: response.status })
    }).catch(() => {});
    return response;
  },
  (error) => {
    fetch('/api/v1/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'api_response_error', method: error.config?.method?.toUpperCase(), url: error.config?.url, status: error.response?.status, message: error.message })
    }).catch(() => {});
    if (error.response?.status === 401) {
      localStorage.removeItem('shopsphere-token');
      // Optionally redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
