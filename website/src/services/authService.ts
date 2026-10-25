import { api } from "./api";
import { User } from "@/types/user";

// Estrutura dos dados enviados no formulário de login
export interface LoginCredentials {
  email: string;
  password?: string;
}

// Estrutura da resposta devolvida pelo seu AuthController (com token e user)
export interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

export const authService = {
  /**
   * Realiza a autenticação do usuário com e-mail e senha.
   * Rota no Express: POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    return response.data;
  },

  /**
   * Enerra a sessão do usuário no servidor.
   * Rota no Express: POST /auth/logout
   */
  async logout(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/auth/logout");
    return response.data;
  },
};