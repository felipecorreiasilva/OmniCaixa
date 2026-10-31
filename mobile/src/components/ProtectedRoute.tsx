import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { ReactNode, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("admin" | "cashier" | "manager")[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se terminou de carregar o estado e não há usuário, redireciona para o login
    if (!loading && !user) {
      router.replace("/login");
      return;
    }

    // Se a rota exige cargos específicos e o usuário não possui a role necessária
    if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/unauthorized"); // Redireciona para uma tela de acesso negado
    }
  }, [user, loading, router, allowedRoles]);

  // Exibe tela de carregamento enquanto o AuthContext valida o token / AsyncStorage
  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#22d3ee" />
      </View>
    );
  }

  // Se não estiver logado, não renderiza nada até o redirecionamento acontecer
  if (!user) {
    return null;
  }

  // Se exigir roles e o usuário não tiver permissão, bloqueia a renderização
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}