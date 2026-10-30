import { authService } from "@/services/authService";
import { User } from "@/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";

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

  // Carrega os dados salvos no AsyncStorage ao iniciar a aplicação mobile
  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedToken = await AsyncStorage.getItem("@OmniCaixa:token");
        const storedUser = await AsyncStorage.getItem("@OmniCaixa:user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erro ao carregar dados de autenticação:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  // Função chamada no login bem-sucedido
  const login = async (newToken: string, newUser: User) => {
    try {
      await AsyncStorage.setItem("@OmniCaixa:token", newToken);
      await AsyncStorage.setItem("@OmniCaixa:user", JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);

      // Redireciona para o painel de PDV usando Expo Router
      router.replace("/(dashboard)/pdv");
    } catch (error) {
      console.error("Erro ao salvar dados de login:", error);
    }
  };

  // Função para deslogar o utilizador
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Erro ao terminar sessão no servidor:", error);
    } finally {
      // Limpa o armazenamento local do telemóvel
      await AsyncStorage.removeItem("@OmniCaixa:token");
      await AsyncStorage.removeItem("@OmniCaixa:user");

      setToken(null);
      setUser(null);

      router.replace("/(auth)/login");
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