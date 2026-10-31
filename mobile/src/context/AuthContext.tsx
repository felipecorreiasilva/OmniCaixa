import { authService } from "@/services/authService";
import { tokenService } from "@/services/tokenService";
import { userService } from "@/services/userService";
import { User } from "@/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Carrega o token do AsyncStorage e valida antes de buscar o usuário
  useEffect(() => {
    async function initializeAuth() {
      try {
        const storedToken = await AsyncStorage.getItem("token");

        // Valida o token antes de qualquer chamada à API para evitar 401
        if (storedToken && tokenService.isTokenValid(storedToken)) {
          setToken(storedToken);
          
          const userId = tokenService.getUserIdFromToken(storedToken);

          if (userId) {
            const freshUserData = await userService.getUserById(userId);
            setUser(freshUserData);
          } else {
            throw new Error("ID inválido no token.");
          }
        } else {
          // Se não houver token ou se for inválido/expirado
          await AsyncStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Sessão inválida ou expirada no mobile:", error);
        await AsyncStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initializeAuth();
  }, []);

  // Função chamada no login bem-sucedido
  const login = async (newToken: string) => {
    try {
      await AsyncStorage.setItem("token", newToken);
      setToken(newToken);

      const userId = tokenService.getUserIdFromToken(newToken);
      if (userId) {
        const freshUserData = await userService.getUserById(userId);
        setUser(freshUserData);
      }

      router.replace("/");
    } catch (error) {
      console.error("Erro ao processar login no mobile:", error);
    }
  };

  // Função para deslogar o usuário
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Erro ao terminar sessão no servidor:", error);
    } finally {
      await AsyncStorage.removeItem("token");
      setToken(null);
      setUser(null);
      router.replace("/login");
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

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
}