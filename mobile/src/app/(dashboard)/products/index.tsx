import CreateProductModal from '@/components/products/CreateProductModal';
import DeleteProductModal from '@/components/products/DeleteProductModal';
import EditProductModal from '@/components/products/EditProductModal';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { productService } from '@/services/productService';
import { Product } from '@/types/product';
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
    const { user } = useAuth(); // Obtém o utilizador logado para verificar o cargo (role)
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // Estado para a barra de pesquisa
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

    // Carregar produtos ao abrir a página
    useEffect(() => {
        loadProducts();
    }, []);

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
            <View className="flex-1 bg-gray-50 p-4">
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                    
                    {/* Cabeçalho e Botão de Novo Produto */}
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-1 pr-2">
                            <Text className="text-xl font-bold text-gray-800">Produtos e Estoque</Text>
                            <Text className="text-xs text-gray-500">Gerencie os itens disponíveis no PDV.</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setIsModalOpen(true)}
                            className="bg-blue-600 px-4 py-2.5 rounded-xl flex-row items-center justify-center shadow-sm"
                        >
                            <Text className="text-white font-semibold text-sm">+ Novo</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Barra de Pesquisa */}
                    <View className="relative w-full mb-4">
                        <View className="absolute inset-y-0 left-0 pl-3 flex items-center justify-center z-10">
                            <Search size={18} color="#9ca3af" />
                        </View>
                        <TextInput
                            placeholder="Pesquisar por nome, código ou categoria..."
                            placeholderTextColor="#9ca3af"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 shadow-sm"
                        />
                    </View>

                    {error ? (
                        <View className="bg-red-100 p-3 rounded-xl mb-4">
                            <Text className="text-red-700 text-sm text-center">{error}</Text>
                        </View>
                    ) : null}

                    {loading ? (
                        <View className="py-20 items-center justify-center">
                            <ActivityIndicator size="large" color="#2563eb" />
                            <Text className="text-gray-500 text-sm mt-2">A carregar produtos...</Text>
                        </View>
                    ) : filteredProducts.length === 0 ? (
                        <View className="py-16 items-center justify-center bg-white rounded-2xl border border-gray-200 shadow-sm px-4">
                            <Text className="text-gray-400 text-sm text-center">
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
                                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex-col justify-between gap-3"
                                    >
                                        <View className="flex-row justify-between items-start gap-3">
                                            {/* Imagem do Produto */}
                                            <View className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shrink-0 items-center justify-center">
                                                {product.image_url ? (
                                                    <Image 
                                                        source={{ uri: `${API_URL}${product.image_url}` }} 
                                                        className="w-full h-full"
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <ImageIcon size={20} color="#9ca3af" />
                                                )}
                                            </View>

                                            <View className="flex-1 min-w-0">
                                                <Text className="text-xs font-mono text-gray-400">#{product.id}</Text>
                                                <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>
                                                    {product.name}
                                                </Text>
                                                <View className="flex-row items-center gap-2 mt-1 flex-wrap">
                                                    <View className="bg-gray-100 px-2 py-0.5 rounded-full">
                                                        <Text className="text-gray-600 text-[11px]">
                                                            {product.category || 'Geral'}
                                                        </Text>
                                                    </View>
                                                    <Text className="text-xs font-mono text-gray-500" numberOfLines={1}>
                                                        {product.barcode || 'Sem código'}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View className="items-end shrink-0">
                                                <Text className="text-sm font-bold text-blue-600">
                                                    R$ {Number(product.price).toFixed(2)}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                                            <Text className="text-gray-500 text-xs">
                                                Estoque: <Text className="font-bold text-gray-900">{formattedStock} {isKg ? 'kg' : 'un.'}</Text>
                                            </Text>
                                            
                                            <View className="flex-row items-center gap-2">
                                                <TouchableOpacity 
                                                    onPress={() => setEditingProduct(product)}
                                                    className="p-2 bg-blue-50 rounded-lg border border-blue-200"
                                                >
                                                    <SquarePen size={16} color="#2563eb" />
                                                </TouchableOpacity>

                                                {/* Botão de Excluir visível apenas para admin */}
                                                {user?.role === 'admin' && (
                                                    <TouchableOpacity 
                                                        onPress={() => setDeletingProduct(product)}
                                                        className="p-2 bg-red-50 rounded-lg border border-red-200"
                                                    >
                                                        <Trash size={16} color="#dc2626" />
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