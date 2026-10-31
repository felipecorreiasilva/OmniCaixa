"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ShoppingCart, Package, Users, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect } from "react";

export default function DashboardHomePage() {
  const { user } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            window.location.href = '/login';
            return;
        }

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            const { exp } = JSON.parse(jsonPayload);
            const currentTime = Date.now() / 1000;

            if (exp && currentTime > exp) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        } catch (err) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 bg-zinc-950 min-h-screen text-zinc-100">
      
      {/* Cabeçalho de Boas-vindas com Estilo Dark Moderno */}
      <div className="bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-3 border border-cyan-500/20">
            <Sparkles size={14} /> Painel de Gestão
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Olá, <span className="text-cyan-400">{user?.name || "Funcionário"}</span> 👋
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            Bem-vindo ao painel de controlo do <span className="font-medium text-zinc-200">OmniCaixa</span>. Selecione uma opção abaixo para começar a gerir o seu negócio.
          </p>
        </div>
      </div>

      {/* Atalhos Rápidos / Cards de Navegação */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-200 tracking-tight">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card PDV */}
          <Link
            href="/pdv"
            className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 hover:border-cyan-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-zinc-950 transition-all duration-300 shadow-sm">
                <ShoppingCart size={26} />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition">Frente de Caixa (PDV)</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                Iniciar vendas rápidas, consultar produtos em tempo real e processar pagamentos com segurança.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-cyan-400">
              <span>Abrir PDV</span>
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </Link>

          {/* Card Produtos */}
          <Link
            href="/products"
            className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 hover:border-cyan-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-zinc-950 transition-all duration-300 shadow-sm">
                <Package size={26} />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition">Gestão de Produtos</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                Cadastrar novos itens, gerir o stock físico, controlar quantidades e atualizar preços facilmente.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-zinc-400 group-hover:text-cyan-400 transition">
              <span>Gerir Produtos</span>
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </Link>

          {/* Card Funcionários */}
          <Link
            href="/users"
            className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 hover:border-cyan-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-zinc-950 transition-all duration-300 shadow-sm">
                <Users size={26} />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition">Funcionários</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                Administrar utilizadores, configurar controlos de acesso por cargo e gerir a equipa de operadores.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-zinc-400 group-hover:text-cyan-400 transition">
              <span>Ver Funcionários</span>
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </Link>

        </div>
      </div>

    </div>
  );
}