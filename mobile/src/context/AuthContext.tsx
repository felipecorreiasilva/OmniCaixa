"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import { authService } from "@/services/authService";

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Carrega os dados salvos no localStorage ao iniciar a aplicação
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // Função chamada no login bem-sucedido
  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);

    // Redireciona para a tela inicial do dashboard
    router.push("/");
  };

  // Função para deslogar o usuário (integrada com o back-end)
  const logout = async () => {
    try {
      // Opcional: Avisa o servidor para encerrar a sessão
      await authService.logout();
    } catch (error) {
      console.error("Erro ao terminar sessão no servidor:", error);
    } finally {
      // Limpa os dados locais independentemente da resposta da API
      localStorage.removeItem("token");
      localStorage.removeItem("user");

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