import { productService } from '@/services/productService';
import { Product } from '@/types/product';
import { AlertTriangle, X } from 'lucide-react-native';
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
            <View className="flex-1 bg-black/70 items-center justify-center p-4">
                <View className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                    
                    {/* Cabeçalho */}
                    <View className="flex-row justify-between items-center px-5 py-4 bg-zinc-950 border-b border-zinc-800">
                        <View className="flex-row items-center gap-2">
                            <Text className="text-red-400 font-bold text-base">Excluir Produto</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="p-1 bg-zinc-900 rounded-lg">
                            <X size={18} color="#a1a1aa" />
                        </TouchableOpacity>
                    </View>

                    {/* Corpo do Modal */}
                    <View className="p-6 items-center">
                        <View className="flex items-center justify-center h-14 w-14 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
                            <AlertTriangle size={28} color="#f87171" />
                        </View>

                        <Text className="text-xl font-bold text-white mb-2 text-center">
                            Tem certeza?
                        </Text>
                        
                        <Text className="text-sm text-zinc-400 mb-2 text-center">
                            Deseja excluir o produto <Text className="font-semibold text-white">"{product.name}"</Text>?
                        </Text>
                        <Text className="text-xs text-zinc-500 text-center">
                            Esta ação não poderá ser desfeita.
                        </Text>
                    </View>

                    {/* Rodapé / Ações */}
                    <View className="p-4 bg-zinc-950 border-t border-zinc-800 flex-row gap-2">
                        <TouchableOpacity
                            onPress={onClose}
                            disabled={loading}
                            className="flex-1 py-3 bg-zinc-900 border border-zinc-800 rounded-xl items-center"
                        >
                            <Text className="text-zinc-300 font-semibold text-xs">Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleDelete}
                            disabled={loading}
                            className="flex-1 py-3 bg-red-600 rounded-xl items-center flex-row justify-center gap-1.5 opacity-90 active:opacity-100 disabled:opacity-30"
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text className="text-white font-semibold text-xs">Sim, Excluir</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
}