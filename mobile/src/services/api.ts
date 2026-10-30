import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.2.107:3333',
});

// 1. Interceptor de Requisição: Injeta o token JWT gravado no AsyncStorage
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@OmniCaixa:token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erro ao recuperar o token do AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Interceptor de Resposta: Deteta se o token expirou (Erro 401) e redireciona para o login
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Sessão expirada ou inválida. A redirecionar para o login...');

      try {
        // Limpa os dados da sessão local no telemóvel
        await AsyncStorage.removeItem('@OmniCaixa:token');
        await AsyncStorage.removeItem('@OmniCaixa:user');

        // Redireciona o operador para o ecrã de login usando o Expo Router
        router.replace('/(auth)/login');
      } catch (e) {
        console.error('Erro ao limpar a sessão no logout automático:', e);
      }
    }

    return Promise.reject(error);
  }
);