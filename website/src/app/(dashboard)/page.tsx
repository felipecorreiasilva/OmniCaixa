"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ShoppingCart, Package, Users, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function DashboardHomePage() {
  const { user } = useAuth();

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-full text-slate-800">
      
      {/* Cabeçalho de Boas-vindas com Estilo Light Moderno */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        {/* Detalhe decorativo de fundo */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-600 text-xs font-semibold mb-3 border border-cyan-100">
            <Sparkles size={14} /> Painel de Gestão
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Olá, <span className="text-cyan-600">{user?.name || "Funcionário"}</span> 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Bem-vindo ao painel de controlo do <span className="font-medium text-slate-700">OmniCaixa</span>. Selecione uma opção abaixo para começar a gerir o seu negócio.
          </p>
        </div>

      </div>

      {/* Atalhos Rápidos / Cards de Navegação */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card PDV (Frente de Caixa) */}
          <Link
            href="/pdv"
            className="bg-white p-6 rounded-3xl border border-slate-400 hover:border-cyan-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="w-14 h-14 bg-cyan-50 border border-cyan-100 rounded-2xl flex items-center justify-center text-cyan-600 mb-5 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <ShoppingCart size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-cyan-600 transition">Frente de Caixa (PDV)</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Iniciar vendas rápidas, consultar produtos em tempo real e processar pagamentos com segurança.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-cyan-600">
              <span>Abrir PDV</span>
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </Link>

          {/* Card Produtos */}
          <Link
            href="/products"
            className="bg-white p-6 rounded-3xl border border-slate-400 hover:border-cyan-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 mb-5 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-all duration-300 shadow-sm">
                <Package size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-cyan-600 transition">Gestão de Produtos</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Cadastrar novos itens, gerir o stock físico, controlar quantidades e atualizar preços facilmente.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-slate-600 group-hover:text-cyan-600 transition">
              <span>Gerir Produtos</span>
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </Link>

          {/* Card Usuários */}
          <Link
            href="/users"
            className="bg-white p-6 rounded-3xl border border-slate-400 hover:border-cyan-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 mb-5 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-all duration-300 shadow-sm">
                <Users size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-cyan-600 transition">Funcionários</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Administrar utilizadores, configurar controlos de acesso por cargo e gerir a equipa de operadores.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-slate-600 group-hover:text-cyan-600 transition">
              <span>Ver Funcionários</span>
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </Link>

        </div>
      </div>

    </div>
  );
}