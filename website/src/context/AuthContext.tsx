"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { User } from "@/types/user";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Carrega os dados salvos no navegador ao iniciar a aplicação
    const storedToken = localStorage.getItem("@OmniCaixa:token");
    const storedUser = localStorage.getItem("@OmniCaixa:user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("@OmniCaixa:token", newToken);
    localStorage.setItem("@OmniCaixa:user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    router.push("/"); // Redireciona para a home/dashboard após logar
  };

  const logout = () => {
    localStorage.removeItem("@OmniCaixa:token");
    localStorage.removeItem("@OmniCaixa:user");
    setToken(null);
    setUser(null);
    router.push("/login"); // Redireciona para a tela de login
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);