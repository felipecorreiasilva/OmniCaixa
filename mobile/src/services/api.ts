import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333',
});

// 1. Interceptor de Requisição: Injeta o token JWT em TODAS as requisições
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

// 2. Interceptor de Resposta: Deteta se o token expirou (Erro 401) e desloga o utilizador
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se o backend retornar 401 (Unauthorized), o token expirou ou é inválido
    if (error.response && error.response.status === 401) {
      console.warn('Sessão expirada. A redirecionar para o login...');

      if (typeof window !== 'undefined') {
        // Limpa os dados da sessão
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redireciona o operador para a página de login
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);