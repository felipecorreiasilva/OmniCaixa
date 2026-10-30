import { authService } from "@/services/authService";
import { tokenService } from "@/services/tokenService";
import { userService } from "@/services/userService";
import { User } from "@/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router"; // ou o teu router do react-navigation
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

  // Carrega o token do AsyncStorage e valida/busca os dados reais do usuário ao iniciar
  useEffect(() => {
    async function initializeAuth() {
      try {
        const storedToken = await AsyncStorage.getItem("token");

        if (storedToken) {
          setToken(storedToken);
          
          // Extrai o ID do usuário diretamente do token JWT
          const userId = tokenService.getUserIdFromToken(storedToken);

          if (userId) {
            // Busca os dados atualizados e verdadeiros diretamente na base de dados
            const freshUserData = await userService.getUserById(userId);
            setUser(freshUserData);
          } else {
            throw new Error("ID inválido no token.");
          }
        }
      } catch (error) {
        console.error("Sessão inválida ou erro ao carregar usuário no mobile:", error);
        // Se o token for inválido ou expirar, limpa tudo
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

      // Extrai o ID e busca os dados do usuário recém-logado
      const userId = tokenService.getUserIdFromToken(newToken);
      if (userId) {
        const freshUserData = await userService.getUserById(userId);
        setUser(freshUserData);
      }

      // Redireciona para a tela inicial do PDV/Dashboard
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
      // Remove o token do armazenamento local do telemóvel
      await AsyncStorage.removeItem("token");

      setToken(null);
      setUser(null);

      // Redireciona para a tela de login
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

// Hook personalizado para facilitar o uso do contexto
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
}