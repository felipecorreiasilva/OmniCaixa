import CreateProductModal from '@/components/products/CreateProductModal';
import DeleteProductModal from '@/components/products/DeleteProductModal';
import EditProductModal from '@/components/products/EditProductModal';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { productService } from '@/services/productService';
import { tokenService } from '@/services/tokenService';
import { Product } from '@/types/product';
import { useRouter } from 'expo-router';
import { Image as ImageIcon, Search, SquarePen, Trash } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.2.107:3333";

export default function ProductsPage() {
    const router = useRouter();        
    const { user } = useAuth(); // Obtém o utilizador logado para verificar o cargo (role)
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // Estado para a barra de pesquisa
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

    // Validação do token JWT, verificação do utilizador e carregamento dos produtos
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!tokenService.isTokenValid(token)) {
            localStorage.removeItem('token');
            router.push('/login');
            return;
        }

        if (user) {
            loadProducts();
        }
    }, [user, router]);

    async function loadProducts() {
        try {
            setLoading(true);
            const data = await productService.getAllProducts();
            setProducts(data);
        } catch (err) {
            setError('Erro ao carregar a lista de produtos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // Filtra os produtos com base no nome, código de barras ou categoria
    const filteredProducts = products.filter((product) => {
        const term = searchTerm.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(term);
        const matchesBarcode = product.barcode ? product.barcode.toLowerCase().includes(term) : false;
        const matchesCategory = product.category ? product.category.toLowerCase().includes(term) : false;

        return matchesName || matchesBarcode || matchesCategory;
    });

    return (
        <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <View className="flex-1 bg-zinc-950 p-4">
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                    
                    {/* Cabeçalho e Botão de Novo Produto */}
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-1 pr-2">
                            <Text className="text-xl font-bold text-white">Produtos e Estoque</Text>
                            <Text className="text-xs text-zinc-400">Gerencie os itens disponíveis no PDV.</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setIsModalOpen(true)}
                            className="bg-blue-600 px-4 py-2.5 rounded-xl flex-row items-center justify-center shadow-sm active:opacity-80"
                        >
                            <Text className="text-white font-semibold text-sm">+ Novo</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Barra de Pesquisa */}
                    <View className="relative w-full mb-4">
                        <View className="absolute inset-y-0 left-0 pl-3 flex items-center justify-center z-10">
                            <Search size={18} color="#71717a" />
                        </View>
                        <TextInput
                            placeholder="Pesquisar por nome, código ou categoria..."
                            placeholderTextColor="#71717a"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white shadow-sm"
                        />
                    </View>

                    {error ? (
                        <View className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-4">
                            <Text className="text-red-400 text-sm text-center">{error}</Text>
                        </View>
                    ) : null}

                    {loading ? (
                        <View className="py-20 items-center justify-center">
                            <ActivityIndicator size="large" color="#38bdf8" />
                            <Text className="text-zinc-400 text-sm mt-2">A carregar produtos...</Text>
                        </View>
                    ) : filteredProducts.length === 0 ? (
                        <View className="py-16 items-center justify-center bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm px-4">
                            <Text className="text-zinc-500 text-sm text-center">
                                Nenhum produto encontrado para "{searchTerm}".
                            </Text>
                        </View>
                    ) : (
                        /* Lista em Cards Otimizada para Mobile */
                        <View className="space-y-3">
                            {filteredProducts.map((product) => {
                                const nameLower = product.name.toLowerCase();
                                const isKg = nameLower.includes("(kg)") || nameLower.includes("kg");
                                
                                const formattedStock = isKg 
                                    ? Number(product.stock).toFixed(3) 
                                    : Math.round(Number(product.stock));

                                return (
                                    <View 
                                        key={product.id} 
                                        className="bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-800 flex-col justify-between gap-3"
                                    >
                                        <View className="flex-row justify-between items-start gap-3">
                                            {/* Imagem do Produto */}
                                            <View className="w-14 h-14 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shrink-0 items-center justify-center">
                                                {product.image_url ? (
                                                    <Image 
                                                        source={{ uri: `${API_URL}${product.image_url}` }} 
                                                        className="w-full h-full"
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <ImageIcon size={20} color="#71717a" />
                                                )}
                                            </View>

                                            <View className="flex-1 min-w-0">
                                                <Text className="text-xs font-mono text-zinc-500">#{product.id}</Text>
                                                <Text className="font-bold text-white text-base" numberOfLines={1}>
                                                    {product.name}
                                                </Text>
                                                <View className="flex-row items-center gap-2 mt-1 flex-wrap">
                                                    <View className="bg-zinc-800 px-2 py-0.5 rounded-full">
                                                        <Text className="text-zinc-300 text-[11px]">
                                                            {product.category || 'Geral'}
                                                        </Text>
                                                    </View>
                                                    <Text className="text-xs font-mono text-zinc-400" numberOfLines={1}>
                                                        {product.barcode || 'Sem código'}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View className="items-end shrink-0">
                                                <Text className="text-sm font-bold text-cyan-400">
                                                    R$ {Number(product.price).toFixed(2)}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="flex-row justify-between items-center pt-3 border-t border-zinc-800/80">
                                            <Text className="text-zinc-400 text-xs">
                                                Estoque: <Text className="font-bold text-white">{formattedStock} {isKg ? 'kg' : 'un.'}</Text>
                                            </Text>
                                            
                                            <View className="flex-row items-center gap-2">
                                                <TouchableOpacity 
                                                    onPress={() => setEditingProduct(product)}
                                                    className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 active:opacity-60"
                                                >
                                                    <SquarePen size={16} color="#38bdf8" />
                                                </TouchableOpacity>

                                                {/* Botão de Excluir visível apenas para admin */}
                                                {user?.role === 'admin' && (
                                                    <TouchableOpacity 
                                                        onPress={() => setDeletingProduct(product)}
                                                        className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 active:opacity-60"
                                                    >
                                                        <Trash size={16} color="#f87171" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Modais Adaptados */}
                    <CreateProductModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSuccess={() => {
                            setIsModalOpen(false);
                            loadProducts();
                        }}
                    />

                    <EditProductModal 
                        isOpen={!!editingProduct}
                        product={editingProduct}
                        onClose={() => setEditingProduct(null)}
                        onSuccess={() => {
                            setEditingProduct(null);
                            loadProducts();
                        }}
                    />

                    <DeleteProductModal
                        isOpen={!!deletingProduct}
                        product={deletingProduct}
                        onClose={() => setDeletingProduct(null)}
                        onSuccess={() => {
                            setDeletingProduct(null);
                            loadProducts();
                        }}
                    />
                </ScrollView>
            </View>
        </ProtectedRoute>
    );
}