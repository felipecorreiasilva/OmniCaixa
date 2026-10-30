"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { tokenService } from "@/services/tokenService";

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Carrega o token e valida/busca os dados reais do usuário no backend ao iniciar
  useEffect(() => {
    async function initializeAuth() {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        setToken(storedToken);
        
        try {
          // Extrai o ID do usuário diretamente do token JWT
          const userId = tokenService.getUserIdFromToken(storedToken);

          if (userId) {
            // Busca os dados atualizados e verdadeiros diretamente na base de dados
            const freshUserData = await userService.getUserById(userId);
            setUser(freshUserData);
          } else {
            throw new Error("ID inválido no token.");
          }
        } catch (error) {
          console.error("Sessão inválida ou erro ao carregar usuário:", error);
          // Se o token for inválido ou expirar, limpa tudo
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }

      setLoading(false);
    }

    initializeAuth();
  }, []);

  // Função chamada no login bem-sucedido (agora só precisa do token)
  const login = async (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);

    try {
      // Extrai o ID e busca os dados do usuário recém-logado
      const userId = tokenService.getUserIdFromToken(newToken);
      if (userId) {
        const freshUserData = await userService.getUserById(userId);
        setUser(freshUserData);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário após login:", error);
    }

    // Redireciona para a tela inicial do dashboard
    router.push("/");
  };

  // Função para deslogar o usuário
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Erro ao terminar sessão no servidor:", error);
    } finally {
      // Limpa apenas o token (já não guardamos 'user' no localStorage)
      localStorage.removeItem("token");

      setToken(null);
      setUser(null);

      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para facilitar o uso do contexto em outros componentes
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
}