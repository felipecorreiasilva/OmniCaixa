"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart, Search, Trash2, Plus, Minus, CreditCard, DollarSign, Barcode } from "lucide-react";

export default function PDVPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<any[]>([]);

  // Exemplo simulado de produtos (depois podes integrar o productService.ts)
  const productsMock = [
    { id: 1, name: "Refrigerante 350ml", price: 6.50, stock: 45 },
    { id: 2, name: "Água Mineral 500ml", price: 4.00, stock: 120 },
    { id: 3, name: "Salgado Assado", price: 8.50, stock: 15 },
    { id: 4, name: "Café Expresso", price: 5.00, stock: 50 },
  ];

  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const itemExists = prevCart.find((item) => item.id === product.id);
      if (itemExists) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const totalCart = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-gray-100 overflow-hidden">
      
      {/* Lado Esquerdo: Catálogo de Produtos e Busca */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
        
        {/* Cabeçalho da Área de Produtos */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Frente de Caixa (PDV)</h1>
            <p className="text-sm text-gray-500">Operador: <span className="font-semibold text-gray-700">{user?.name || "Funcionário"}</span></p>
          </div>

          {/* Barra de Pesquisa / Leitor de Código de Barras */}
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Pesquisar produto ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        </div>

        {/* Grelha de Produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {productsMock
            .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md border border-gray-200 cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">{product.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">Estoque: {product.stock} un.</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-indigo-600">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium flex items-center gap-1">
                    <Plus size={14} /> Adicionar
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Lado Direito: Carrinho e Resumo do Pagamento */}
      <div className="w-full md:w-96 bg-white border-l border-gray-200 flex flex-col justify-between shadow-lg">
        
        {/* Título do Carrinho */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2 text-gray-800 font-bold">
            <ShoppingCart size={20} />
            <span>Carrinho Atual</span>
          </div>
          <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-semibold">
            {cart.reduce((acc, item) => acc + item.quantity, 0)} itens
          </span>
        </div>

        {/* Lista de Itens no Carrinho */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center space-y-2">
              <ShoppingCart size={40} className="stroke-1" />
              <p className="text-sm">O carrinho está vazio.<br/>Selecione os produtos ao lado.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-800">{item.name}</h4>
                  <p className="text-xs text-gray-500">R$ {item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé do Carrinho e Botões de Pagamento */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
          <div className="flex justify-between items-center text-lg font-bold text-gray-900">
            <span>Total a Pagar:</span>
            <span className="text-indigo-600">R$ {totalCart.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={cart.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 shadow-sm"
            >
              <DollarSign size={16} /> Dinheiro
            </button>
            <button
              disabled={cart.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 shadow-sm"
            >
              <CreditCard size={16} /> Cartão / Pix
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}