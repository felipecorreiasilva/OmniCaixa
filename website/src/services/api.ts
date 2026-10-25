import axios from 'axios';

export const api = axios.create({
  // Ajustado para http://localhost:3333 conforme o seu server.ts
  baseURL: 'http://localhost:3333', 
});

// Interceptor global: Injeta o token JWT em TODAS as requisições feitas pelo app
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
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