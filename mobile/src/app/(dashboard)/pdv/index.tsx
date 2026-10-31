import { useAuth } from "@/context/AuthContext";
import { productService } from "@/services/productService";
import { saleService } from "@/services/saleService";
import { CartItem, Product } from "@/types/product";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreditCard, DollarSign, Minus, Plus, QrCode, Scale, Search, ShoppingCart, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

// Importação dos Modais de Pagamento Nativos para o Expo
import PaymentCardModal from "@/components/pdv/PaymentCardModal";
import PaymentMoneyModal from "@/components/pdv/PaymentMoneyModal";
import PaymentPixModal from "@/components/pdv/PaymentPixModal";
import { tokenService } from "@/services/tokenService";
import { useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.2.107:3333";

export default function PDVPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Estados para controlar a abertura dos modais de pagamento
  const [isMoneyModalOpen, setIsMoneyModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);

  // Validação do token JWT, verificação do utilizador e carregamento dos produtos
  useEffect(() => {
  async function checkAuthAndLoadProducts() {
    try {
      // 1. Obter o token do AsyncStorage de forma assíncrona
      const token = await AsyncStorage.getItem('token');

      // 2. Validar o token
      if (!tokenService.isTokenValid(token)) {
        await AsyncStorage.removeItem('token');
        router.replace('/login');
        return;
      }

      // 3. Carregar os produtos se o utilizador estiver autenticado
      if (user) {
        setLoading(true);
        const data = await productService.getAllProducts();
        setProducts(data);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos ou verificar autenticação:", error);
    } finally {
      setLoading(false);
    }
  }

  checkAuthAndLoadProducts();
}, [user, router]);

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

  const handleFinalizeSale = async (method: string, amountPaid?: number, change?: number) => {
    try {
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

      await saleService.createSale(saleData);

      Alert.alert(
        'Sucesso', 
        `Venda realizada com sucesso via ${method}!\nTotal: R$ ${totalCart.toFixed(2)}${change !== undefined ? `\nTroco: R$ ${change.toFixed(2)}` : ''}`
      );
      
      setCart([]);
    } catch (error) {
      console.error("Erro ao gravar venda no banco de dados:", error);
      Alert.alert("Erro", "Erro ao finalizar a venda. Verifique a conexão com o servidor.");
    }
  };

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesName = p.name.toLowerCase().includes(term);
    const matchesBarcode = p.barcode ? p.barcode.toLowerCase().includes(term) : false;
    return matchesName || matchesBarcode;
  });

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      className="flex-1 bg-zinc-950"
    >
      <ScrollView 
        className="flex-1 bg-zinc-950" 
        contentContainerStyle={{ paddingBottom: 180 }}
        automaticallyAdjustKeyboardInsets={true}
        keyboardShouldPersistTaps="handled"
      >
        
        {/* CABEÇALHO E PESQUISA */}
        <View className="p-4 bg-zinc-900 border-b border-zinc-800 gap-3">
          <View>
            <Text className="text-xl font-bold text-white">Frente de Caixa (PDV)</Text>
            <Text className="text-xs text-zinc-400">Operador: <Text className="font-semibold text-cyan-400">{user?.name || "Funcionário"}</Text></Text>
          </View>

          <View className="relative flex-row items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5">
            <Search size={18} color="#a1a1aa" />
            <TextInput
              className="flex-1 ml-3 text-white text-base"
              placeholder="Pesquisar produto ou código..."
              placeholderTextColor="#71717a"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
        </View>

        {/* CATÁLOGO DE PRODUTOS */}
        <View className="p-4">
          <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Produtos Disponíveis
          </Text>

          {loading ? (
            <View className="py-10 items-center justify-center">
              <ActivityIndicator size="large" color="#38bdf8" />
            </View>
          ) : filteredProducts.length === 0 ? (
            <View className="py-10 items-center justify-center">
              <Text className="text-zinc-500 text-sm text-center">Nenhum produto encontrado.</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between gap-3">
              {filteredProducts.map((product) => {
                const nameLower = product.name.toLowerCase();
                const isKg = nameLower.includes("(kg)") || nameLower.includes("kg");
                const formattedStock = isKg ? Number(product.stock).toFixed(3) : Math.round(Number(product.stock));

                return (
                  <TouchableOpacity
                    key={product.id}
                    onPress={() => addToCart(product)}
                    className="w-[48%] bg-zinc-900 border border-zinc-800 p-3 rounded-2xl justify-between h-44 active:opacity-80"
                  >
                    <View className="flex-row gap-2">
                      <View className="w-12 h-12 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shrink-0 items-center justify-center">
                        {product.image_url ? (
                          <Image 
                            source={{ uri: `${API_URL}${product.image_url}` }} 
                            style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                          />
                        ) : (
                          <Text className="text-[9px] text-zinc-500">Sem foto</Text>
                        )}
                      </View>
                      <View className="flex-1 min-w-0">
                        <View className="flex-row items-center gap-1">
                          <Text className="font-semibold text-white text-xs" numberOfLines={2}>{product.name}</Text>
                          {isKg && <Scale size={12} color="#38bdf8" />}
                        </View>
                        <Text className="text-[10px] text-zinc-400 mt-0.5">Estoque: {formattedStock} {isKg ? 'kg' : 'un.'}</Text>
                      </View>
                    </View>

                    <View className="mt-2 pt-2 border-t border-zinc-800/80 gap-1">
                      <Text className="text-[10px] text-zinc-500 font-mono" numberOfLines={1}>
                        {product.barcode || "Sem código"}
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-bold text-cyan-400">
                          R$ {Number(product.price).toFixed(2)}
                        </Text>
                        <View className="p-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                          <Plus size={14} color="#38bdf8" />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* SEÇÃO DO CARRINHO DE COMPRAS */}
        <View className="p-4 bg-zinc-900/90 border-t border-zinc-800 mx-4 rounded-3xl mt-2 mb-6">
          <View className="flex-row items-center justify-between pb-3 border-b border-zinc-800">
            <View className="flex-row items-center gap-2">
              <ShoppingCart size={18} color="#38bdf8" />
              <Text className="text-white font-bold text-sm">Carrinho Atual</Text>
            </View>
            <Text className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full font-semibold">
              {cart.reduce((acc, item) => acc + (item.name.toLowerCase().includes('kg') ? 1 : item.quantity), 0)} itens
            </Text>
          </View>

          <View className="my-3 gap-2">
            {cart.length === 0 ? (
              <View className="py-8 items-center justify-center">
                <ShoppingCart size={28} color="#52525b" />
                <Text className="text-zinc-500 text-xs text-center mt-2">O carrinho está vazio.</Text>
              </View>
            ) : (
              cart.map((item) => {
                const nameLower = item.name.toLowerCase();
                const isKg = nameLower.includes("(kg)") || nameLower.includes("kg");
                const pesoEmGramas = isKg ? Math.round((item.quantity || 0) * 1000) : null;

                return (
                  <View key={item.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 gap-2">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-2">
                        <Text className="text-xs font-semibold text-white" numberOfLines={1}>{item.name}</Text>
                        <Text className="text-[10px] text-cyan-400">R$ {Number(item.price).toFixed(2)} {isKg ? '/kg' : ''}</Text>
                      </View>
                      <View className="flex-1 flex-row items-center justify-end gap-2">
                        <Text className="text-xs font-bold text-white">R$ {(item.price * (item.quantity || 0)).toFixed(2)}</Text>
                        <TouchableOpacity 
                          onPress={() => removeFromCart(item.id)} 
                          className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 active:opacity-60"
                        >
                          <Trash2 size={14} color="#f87171" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between pt-1.5 border-t border-zinc-800/60">
                      <Text className="text-[10px] text-zinc-400">{isKg ? `(${pesoEmGramas}g)` : 'Qtd:'}</Text>
                      <View className="flex-row items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                        <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} className="w-6 h-6 items-center justify-center">
                          <Minus size={12} color="#a1a1aa" />
                        </TouchableOpacity>
                        <TextInput
                          className="w-12 text-xs font-bold text-white text-center bg-transparent"
                          value={item.quantityStr ?? String(item.quantity)}
                          onChangeText={(val) => handleDirectInputChange(item.id, val)}
                          keyboardType="numeric"
                        />
                        <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} className="w-6 h-6 items-center justify-center">
                          <Plus size={12} color="#a1a1aa" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* RODAPÉ E BOTÕES DE PAGAMENTO */}
          <View className="pt-3 border-t border-zinc-800 gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-zinc-400 text-xs">Total a Pagar:</Text>
              <Text className="text-white font-extrabold text-base">R$ {totalCart.toFixed(2)}</Text>
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                disabled={cart.length === 0}
                onPress={() => setIsMoneyModalOpen(true)}
                className="flex-1 bg-emerald-600 py-3 rounded-xl items-center justify-center gap-1 opacity-90 active:opacity-100 disabled:opacity-30"
              >
                <DollarSign size={14} color="#ffffff" />
                <Text className="text-white font-semibold text-xs">Dinheiro</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={cart.length === 0}
                onPress={() => setIsCardModalOpen(true)}
                className="flex-1 bg-cyan-600 py-3 rounded-xl items-center justify-center gap-1 opacity-90 active:opacity-100 disabled:opacity-30"
              >
                <CreditCard size={14} color="#ffffff" />
                <Text className="text-white font-semibold text-xs">Cartão</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={cart.length === 0}
                onPress={() => setIsPixModalOpen(true)}
                className="flex-1 bg-indigo-600 py-3 rounded-xl items-center justify-center gap-1 opacity-90 active:opacity-100 disabled:opacity-30"
              >
                <QrCode size={14} color="#ffffff" />
                <Text className="text-white font-semibold text-xs">Pix</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>

        {/* MODAIS DE PAGAMENTO */}
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

      </ScrollView>
    </KeyboardAvoidingView>
  );
}