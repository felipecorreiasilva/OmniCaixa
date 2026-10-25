"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, User as UserIcon } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
      {/* Título ou saudação dinâmica */}
      <div className="flex items-center space-x-3">
        <h1 className="text-xl font-bold text-gray-800">OmniCaixa</h1>
        <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full uppercase">
          {user?.role || "PDV"}
        </span>
      </div>

      {/* Informações do Usuário e Ações */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          {user?.image_url ? (
            <img
              src={user.image_url}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border border-gray-300"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
              <UserIcon size={20} />
            </div>
          )}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-800">{user?.name || "Usuário"}</p>
            <p className="text-xs text-gray-500">{user?.email || "usuario@omnicaixa.com"}</p>
          </div>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        {/* Botão de Logout */}
        <button
          onClick={logout}
          title="Sair do sistema"
          className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium hidden md:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}