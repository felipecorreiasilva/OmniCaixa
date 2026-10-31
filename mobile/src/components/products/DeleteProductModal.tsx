import { productService } from '@/services/productService';
import { Product } from '@/types/product';
import { AlertTriangle } from 'lucide-react-native'; // Nota: no mobile usa-se o lucide-react-native
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface DeleteProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product: Product | null;
}

export default function DeleteProductModal({ isOpen, onClose, onSuccess, product }: DeleteProductModalProps) {
    const [loading, setLoading] = useState(false);

    if (!isOpen || !product) return null;

    async function handleDelete() {
        if (!product?.id) return;

        try {
            setLoading(true);
            await productService.deleteProduct(product.id);
            onSuccess();
        } catch (err) {
            Alert.alert('Erro', 'Erro ao excluir o produto.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            visible={isOpen}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 items-center justify-center px-4">
                <View className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                    <View className="items-center">
                        <View className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4 text-red-600">
                            <AlertTriangle size={24} color="#dc2626" />
                        </View>

                        <Text className="text-xl font-bold text-gray-800 mb-2">Excluir Produto</Text>
                        
                        <Text className="text-sm text-gray-600 mb-6 text-center">
                            Tem certeza que deseja excluir o produto <Text className="font-semibold text-gray-900">"{product.name}"</Text>? Esta ação não poderá ser desfeita.
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-center gap-3 pt-3 border-t border-gray-100">
                        <TouchableOpacity
                            onPress={onClose}
                            disabled={loading}
                            className="px-4 py-2.5 bg-gray-500 rounded-lg items-center justify-center min-w-[100px]"
                        >
                            <Text className="text-white font-medium text-sm">Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleDelete}
                            disabled={loading}
                            className="px-4 py-2.5 bg-red-600 rounded-lg items-center justify-center flex-row min-w-[130px]"
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text className="text-white font-medium text-sm">Sim, Excluir</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}