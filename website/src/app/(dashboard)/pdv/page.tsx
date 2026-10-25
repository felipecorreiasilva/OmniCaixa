"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { productService } from "@/services/productService";
import { Product } from "@/types/product";
import { ShoppingCart, Search, Trash2, Plus, CreditCard, DollarSign, Loader2 } from "lucide-react";

export default function PDVPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);

  // Carrega os produtos reais do banco de dados ao abrir a página
  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error("Erro ao carregar produtos do banco:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const addToCart = (product: Product) => {
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

  // Filtra os produtos com base na barra de pesquisa
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-black overflow-hidden text-white">
      
      {/* Lado Esquerdo: Catálogo de Produtos e Busca */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
        
        {/* Cabeçalho da Área de Produtos */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Frente de Caixa (PDV)</h1>
            <p className="text-sm text-zinc-400">Operador: <span className="font-semibold text-cyan-400">{user?.name || "Funcionário"}</span></p>
          </div>

          {/* Barra de Pesquisa / Leitor de Código de Barras */}
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Pesquisar produto ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-inner transition"
            />
          </div>
        </div>

        {/* Grelha de Produtos Dinâmica */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 space-y-2">
            <p className="text-sm">Nenhum produto encontrado no banco de dados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-zinc-900 p-4 rounded-xl border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer transition flex flex-col justify-between group"
              >
                <div>
                  {/* Imagem do Produto ou Placeholder */}
                  <div className="w-full h-32 bg-black/50 rounded-lg mb-3 overflow-hidden border border-zinc-800 flex items-center justify-center relative">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="text-zinc-600 flex flex-col items-center gap-1">
                        <span className="text-xs">Sem imagem</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-zinc-100 group-hover:text-cyan-400 transition truncate">{product.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1">Estoque: {product.stock} un.</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-cyan-400">
                    R$ {Number(product.price).toFixed(2)}
                  </span>
                  <span className="p-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-medium flex items-center gap-1 group-hover:bg-cyan-500/20 transition">
                    <Plus size={14} /> Adicionar
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lado Direito: Carrinho e Resumo do Pagamento */}
      <div className="w-full md:w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col justify-between shadow-2xl">
        
        {/* Título do Carrinho */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2 text-zinc-200 font-bold">
            <ShoppingCart size={20} className="text-cyan-400" />
            <span>Carrinho Atual</span>
          </div>
          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs px-2.5 py-1 rounded-full font-semibold">
            {cart.reduce((acc, item) => acc + item.quantity, 0)} itens
          </span>
        </div>

        {/* Lista de Itens no Carrinho */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center space-y-2">
              <ShoppingCart size={40} className="stroke-1 text-zinc-600" />
              <p className="text-sm">O carrinho está vazio.<br/>Selecione os produtos ao lado.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-black/60 p-3 rounded-xl border border-zinc-800">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-zinc-200">{item.name}</h4>
                  <p className="text-xs text-zinc-400">R$ {Number(item.price).toFixed(2)} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-cyan-400">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-300 p-1 bg-red-500/10 rounded-lg border border-red-500/20 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé do Carrinho e Botões de Pagamento */}
        <div className="p-4 border-t border-zinc-800 bg-black/40 space-y-4">
          <div className="flex justify-between items-center text-lg font-bold text-zinc-100">
            <span>Total a Pagar:</span>
            <span className="text-cyan-400">R$ {totalCart.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={cart.length === 0}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <DollarSign size={16} /> Dinheiro
            </button>
            <button
              disabled={cart.length === 0}
              className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <CreditCard size={16} /> Cartão / Pix
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}