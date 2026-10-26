"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Loader2 } from "lucide-react";

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
      router.push("/login");
      return;
    }

    // Se a rota exige cargos específicos e o usuário não possui a role necessária
    if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push("/unauthorized"); // Redireciona para uma página de acesso negado
    }
  }, [user, loading, router, allowedRoles]);

  // Exibe tela de carregamento enquanto o AuthContext verifica o token/localStorage
  if (loading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
      </div>
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