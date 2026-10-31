"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, User as UserIcon, Shield, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  onOpenSidebar?: () => void; // Opcional caso precises de abrir menu em dispositivos móveis
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-zinc-950 px-6 flex items-center justify-between text-white border-b border-zinc-800 shadow-sm">
      
      {/* Lado Esquerdo: Logótipo e Nome da Aplicação / Botão Menu Mobile */}
      <div className="flex items-center gap-4">
        {onOpenSidebar && (
          <button 
            onClick={onOpenSidebar}
            className="md:hidden text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <Menu size={24} />
          </button>
        )}
        
        <Link 
          href="/" 
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="w-9 h-9 relative flex items-center justify-center rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
            <Image 
              src="/logo.png" 
              alt="OmniCaixa Logo" 
              fill 
              className="object-cover"
            />
          </div>
          <span className="font-bold text-lg tracking-wide text-white">
            Omni<span className="text-cyan-400">Caixa</span>
          </span>
        </Link>
      </div>

      {/* Lado Direito: Informações do Utilizador e Botão de Logout */}
      <div className="flex items-center gap-4">
        
        {/* Detalhes do Utilizador */}
        <div className="flex items-center gap-3 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <UserIcon size={16} />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-zinc-200 leading-tight">
              {user?.name || "Operador"}
            </p>
            <p className="text-[10px] text-cyan-400 font-medium uppercase tracking-wider flex items-center gap-1 mt-0.5">
              <Shield size={10} /> {user?.role || "Funcionário"}
            </p>
          </div>
        </div>

        {/* Botão de Terminar Sessão (Logout) */}
        <button
          onClick={logout}
          title="Sair do Sistema"
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-xl text-xs font-medium transition duration-200 cursor-pointer"
        >
          <LogOut size={16} />
          <span className="hidden md:inline">Sair</span>
        </button>

      </div>

    </header>
  );
}