"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { productService } from "@/services/productService";
import { Product, CartItem } from "@/types/product";
import { ShoppingCart, Search, Trash2, Plus, Minus, CreditCard, DollarSign, Loader2, Scale, QrCode } from "lucide-react";

// Importação dos Modais de Pagamento
import PaymentMoneyModal from "@/components/pdv/PaymentMoneyModal";
import PaymentCardModal from "@/components/pdv/PaymentCardModal"; // Modal para Cartão de Crédito/Débito (Maquininha)
import PaymentPixModal from "@/components/pdv/PaymentPixModal";       // Modal exclusivo para Pix da Efí
import { saleService } from "@/services/saleService";

// Define a URL base da API a partir da variável de ambiente
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export default function PDVPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Estados independentes para controlar a abertura de cada modal de pagamento
  const [isMoneyModalOpen, setIsMoneyModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);

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
    if (!product.id) return;

    setCart((prevCart) => {
      const itemExists = prevCart.find((item) => item.id === product.id);
      const nameLower = product.name.toLowerCase();
      const isKg = nameLower.includes("(kg)") || nameLower.includes("kg");
      
      if (itemExists) {
        const step = isKg ? 0.100 : 1;
        const currentQty = typeof itemExists.quantity === 'number' ? itemExists.quantity : parseFloat(String(itemExists.quantity)) || 0;
        const newQty = Number((currentQty + step).toFixed(3));
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty, quantityStr: newQty.toString() } : item
        );
      }
      
      const initialQty = isKg ? 1.000 : 1;
      const newItem: CartItem = {
        id: Number(product.id),
        name: product.name,
        price: Number(product.price),
        stock: product.stock,
        image_url: product.image_url,
        quantity: initialQty,
        quantityStr: initialQty.toString(),
      };

      return [...prevCart, newItem];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prevCart) => {
      return prevCart.reduce<CartItem[]>((acc, item) => {
        if (item.id === id) {
          const nameLower = item.name.toLowerCase();
          const isKg = nameLower.includes("(kg)") || nameLower.includes("kg");
          const step = isKg ? 0.050 : 1; 
          const currentQty = typeof item.quantity === 'number' ? item.quantity : parseFloat(String(item.quantity)) || 0;
          const newQuantity = Number((currentQty + (delta * step)).toFixed(3));
          
          if (newQuantity > 0) {
            acc.push({ ...item, quantity: newQuantity, quantityStr: newQuantity.toString() });
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
    });
  };

  // Função para lidar com a digitação livre no input como string
  const handleDirectInputChange = (id: number, valueStr: string) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === id) {
          const numericValue = parseFloat(valueStr);
          return {
            ...item,
            quantityStr: valueStr,
            quantity: isNaN(numericValue) ? 0 : numericValue
          };
        }
        return item;
      });
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const totalCart = cart.reduce((total, item) => total + item.price * (item.quantity || 0), 0);

  // Função executada quando o pagamento é confirmado com sucesso
  const handleFinalizeSale = async (method: string, amountPaid?: number, change?: number) => {
    try {
      // Prepara os dados para enviar ao backend MySQL
      const saleData = {
        payment_method: method,
        total_amount: totalCart,
        amount_paid: amountPaid,
        change: change,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      // Grava efetivamente no banco de dados MySQL através da API
      await saleService.createSale(saleData);

      alert(`Venda realizada e gravada no banco de dados com sucesso via ${method}!\nTotal: R$ ${totalCart.toFixed(2)}${change !== undefined ? `\nTroco: R$ ${change.toFixed(2)}` : ''}`);

      // Limpa o carrinho após a confirmação
      setCart([]);
    } catch (error) {
      console.error("Erro ao gravar venda no banco de dados:", error);
      alert("Erro ao finalizar a venda. Verifique a conexão com o servidor.");
    }
  };

  // Filtra os produtos com base no nome ou no código de barras
  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesName = p.name.toLowerCase().includes(term);
    const matchesBarcode = p.barcode ? p.barcode.toLowerCase().includes(term) : false;
    
    return matchesName || matchesBarcode;
  });

  // Se o operador bipar o código de barras exato e carregar Enter na barra de pesquisa
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim() !== '') {
      // Procura se existe algum produto com exatamente esse barcode ou nome exato
      const exactMatch = products.find(
        (p) => p.barcode === searchTerm.trim() || p.name.toLowerCase() === searchTerm.toLowerCase()
      );

      if (exactMatch) {
        addToCart(exactMatch);
        setSearchTerm(''); // Limpa a barra de pesquisa para a próxima leitura
      }
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-slate-50 overflow-hidden text-slate-800">
      
      {/* Lado Esquerdo: Catálogo de Produtos e Busca */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
        
        {/* Cabeçalho da Área de Produtos */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Frente de Caixa (PDV)</h1>
            <p className="text-sm text-slate-500">Operador: <span className="font-semibold text-cyan-600">{user?.name || "Funcionário"}</span></p>
          </div>

          {/* Barra de Pesquisa / Leitor de Código de Barras */}
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Pesquisar produto ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm transition"
            />
          </div>
        </div>

        {/* Grelha de Produtos Dinâmica */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <p className="text-sm">Nenhum produto encontrado no banco de dados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const nameLower = product.name.toLowerCase();
              const isKg = nameLower.includes("(kg)") || nameLower.includes("kg");
              
              const formattedStock = isKg 
                ? Number(product.stock).toFixed(3) 
                : Math.round(Number(product.stock));

              return (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white p-4 rounded-2xl border border-slate-400 hover:border-cyan-300 shadow-sm hover:shadow-md cursor-pointer transition flex flex-col justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center p-1">
                      {product.image_url ? (
                        <img 
                          src={`${API_URL}${product.image_url}`} 
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400">Sem foto</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="font-semibold text-slate-900 group-hover:text-cyan-600 transition truncate text-sm">{product.name}</h3>
                        {isKg && (
                          <span title="Produto a granel (Peso)">
                            <Scale size={14} className="text-cyan-600 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Estoque: {formattedStock} {isKg ? 'kg' : 'un.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono">
                        {product.barcode || "Sem código de barras"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-cyan-600">
                        R$ {Number(product.price).toFixed(2)} <span className="text-xs font-normal text-slate-400">{isKg ? '/kg' : ''}</span>
                      </span>
                      <span className="p-1.5 bg-cyan-50 text-cyan-600 border border-cyan-100 rounded-lg text-xs font-medium flex items-center gap-1 group-hover:bg-cyan-500 group-hover:text-white transition">
                        <Plus size={14} /> Adicionar
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lado Direito: Carrinho e Resumo do Pagamento */}
      <div className="w-full md:w-96 bg-white border-l border-slate-200 flex flex-col justify-between shadow-sm">
        
        {/* Título do Carrinho */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <ShoppingCart size={20} className="text-cyan-600" />
            <span>Carrinho Atual</span>
          </div>
          <span className="bg-cyan-50 text-cyan-600 border border-cyan-100 text-xs px-2.5 py-1 rounded-full font-semibold">
            {cart.reduce((acc, item) => acc + (item.name.toLowerCase().includes('kg') ? 1 : item.quantity), 0)} itens
          </span>
        </div>

        {/* Lista de Itens no Carrinho */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-2">
              <ShoppingCart size={40} className="stroke-1 text-slate-300" />
              <p className="text-sm">O carrinho está vazio.<br/>Selecione os produtos ao lado.</p>
            </div>
          ) : (
            cart.map((item) => {
              const nameLower = item.name.toLowerCase();
              const isKg = nameLower.includes("(kg)") || nameLower.includes("kg");
              const pesoEmGramas = isKg ? Math.round((item.quantity || 0) * 1000) : null;

              return (
                <div key={item.id} className="flex flex-col bg-slate-50 p-3 rounded-xl border border-slate-200 gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800 truncate">{item.name}</h4>
                      <p className="text-xs text-cyan-600 font-medium">
                        R$ {Number(item.price).toFixed(2)} {isKg ? '/kg' : ''}
                      </p>
                    </div>

                    {/* Subtotal e Exclusão */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        R$ {(item.price * (item.quantity || 0)).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-600 p-1 bg-red-50 rounded-lg border border-red-100 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Linha Inferior: Controladores de Quantidade e Leitura em Gramas */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {isKg ? `(${pesoEmGramas}g)` : 'Quantidade:'}
                    </span>

                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition"
                        title={isKg ? "Diminuir peso" : "Diminuir 1"}
                      >
                        <Minus size={12} />
                      </button>
                      
                      {/* Input de texto livre com suporte a ponto decimal */}
                      <input
                        type="text"
                        value={item.quantityStr ?? item.quantity}
                        onChange={(e) => handleDirectInputChange(item.id, e.target.value)}
                        className="w-16 text-xs font-bold text-slate-800 text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded"
                      />

                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition"
                        title={isKg ? "Aumentar peso" : "Aumentar 1"}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé do Carrinho e Botões de Pagamento (3 Botões Separados) */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-4">
          <div className="flex justify-between items-center text-lg font-bold text-slate-900">
            <span>Total a Pagar:</span>
            <span className="text-cyan-600">R$ {totalCart.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              disabled={cart.length === 0}
              onClick={() => setIsMoneyModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition flex flex-col items-center justify-center gap-1 text-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <DollarSign size={16} /> Dinheiro
            </button>

            <button
              disabled={cart.length === 0}
              onClick={() => setIsCardModalOpen(true)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-xl transition flex flex-col items-center justify-center gap-1 text-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <CreditCard size={16} /> Cartão
            </button>

            <button
              disabled={cart.length === 0}
              onClick={() => setIsPixModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition flex flex-col items-center justify-center gap-1 text-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <QrCode size={16} /> Pix
            </button>
          </div>
        </div>

      </div>

      {/* Modais de Pagamento */}
      <PaymentMoneyModal
        isOpen={isMoneyModalOpen}
        onClose={() => setIsMoneyModalOpen(false)}
        totalAmount={totalCart}
        onConfirmSale={handleFinalizeSale}
      />

      <PaymentCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        totalAmount={totalCart}
        onConfirmSale={handleFinalizeSale}
      />

      <PaymentPixModal
        isOpen={isPixModalOpen}
        onClose={() => setIsPixModalOpen(false)}
        totalAmount={totalCart}
        onConfirmSale={handleFinalizeSale}
      />

    </div>
  );
}