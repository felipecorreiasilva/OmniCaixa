"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Product } from "@/types/product";
import { ShoppingCart, Package, DollarSign, TrendingUp } from "lucide-react";

export default function HomeDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Exemplo de carregamento rápido dos produtos para o slide/cards
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await api.get("/products"); // Ajuste para a sua rota de backend
        setProducts(response.data);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Boas-vindas e Indicadores Rápidos */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Painel Principal</h1>
          <p className="text-sm text-gray-500">Visão geral do sistema OmniCaixa e atalhos rápidos.</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/pdv"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
          >
            <ShoppingCart size={18} />
            Abrir Frente de Caixa (PDV)
          </a>
        </div>
      </div>

      {/* Cards de Métricas (Dashboard) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vendas Hoje</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">R$ 1.280,00</h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Itens Vendidos</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">42</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Produtos Cadastrados</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{products.length}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Package size={24} />
          </div>
        </div>
      </div>

      {/* Seção de Slide / Grade de Produtos em Destaque */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Produtos em Destaque & Estoque</h2>
          <a href="/products" className="text-sm font-medium text-indigo-600 hover:underline">
            Ver todos &rarr;
          </a>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Carregando produtos...</p>
        ) : (
          /* Container com rolagem horizontal (estilo slide de cards) */
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-55 bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="h-28 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">
                    <Package size={32} />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{product.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Estoque: {product.stock} un.</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-indigo-600 font-bold text-base">
                    R$ {Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    #{product.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}