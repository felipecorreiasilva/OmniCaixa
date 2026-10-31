import { productService } from '@/services/productService';
import * as ImagePicker from 'expo-image-picker';
import { Image as ImageIcon, X } from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface CreateProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface ProductImage {
    uri: string;
    name: string;
    type: string;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.2.107:3333";

export default function CreateProductModal({ isOpen, onClose, onSuccess }: CreateProductModalProps) {
    const [barcode, setBarcode] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [category, setCategory] = useState('');
    const [imageFile, setImageFile] = useState<ProductImage | null>(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    // Função para selecionar imagem da galeria no mobile
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (!permissionResult.granted) {
            Alert.alert('Permissão negada', 'Precisamos de permissão para aceder à galeria.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0].uri) {
            const uri = result.assets[0].uri;
            const filename = uri.split('/').pop() || 'product.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            setImageFile({ uri, name: filename, type });
        }
    };

    async function handleSubmit() {
        if (!name || !price || !stock) {
            Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            
            if (barcode) formData.append('barcode', barcode);
            formData.append('name', name);
            formData.append('price', price);
            formData.append('stock', stock);
            if (category) formData.append('category', category);
            
            if (imageFile) {
                formData.append('image', imageFile as any);
            }

            await productService.createProduct(formData);

            // Limpa o formulário após o sucesso
            setBarcode('');
            setName('');
            setPrice('');
            setStock('');
            setCategory('');
            setImageFile(null);

            onSuccess(); // Fecha o modal e recarrega a lista na página pai
        } catch (err) {
            Alert.alert('Erro', 'Erro ao cadastrar produto. Verifique as permissões (RBAC).');
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
                <View className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl max-h-[90%]">
                    
                    {/* Cabeçalho */}
                    <View className="flex-row justify-between items-center px-5 py-4 bg-zinc-950 border-b border-zinc-800">
                        <View className="flex-row items-center gap-2">
                            <Text className="text-white font-bold text-base">Cadastrar Novo Produto</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="p-1 bg-zinc-900 rounded-lg">
                            <X size={18} color="#a1a1aa" />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Corpo do Modal */}
                    <ScrollView showsVerticalScrollIndicator={false} className="p-5">
                        
                        {/* Campo de Código de Barras */}
                        <View className="mb-3.5">
                            <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                                Código de Barras (EAN-13 / Opcional)
                            </Text>
                            <TextInput
                                value={barcode}
                                onChangeText={setBarcode}
                                maxLength={13}
                                keyboardType="numeric"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-medium"
                                placeholder="Passe o leitor ou digite o código..."
                                placeholderTextColor="#52525b"
                            />
                        </View>

                        {/* Nome do Produto */}
                        <View className="mb-3.5">
                            <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                                Nome do Produto *
                            </Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-medium"
                                placeholder="Ex: Coca-Cola 2L"
                                placeholderTextColor="#52525b"
                            />
                        </View>

                        {/* Preço e Estoque */}
                        <View className="flex-row gap-3 mb-3.5">
                            <View className="flex-1">
                                <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                                    Preço (R$) *
                                </Text>
                                <TextInput
                                    value={price}
                                    onChangeText={setPrice}
                                    keyboardType="numeric"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-medium"
                                    placeholder="0.00"
                                    placeholderTextColor="#52525b"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                                    Estoque Inicial *
                                </Text>
                                <TextInput
                                    value={stock}
                                    onChangeText={setStock}
                                    keyboardType="numeric"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-medium"
                                    placeholder="10"
                                    placeholderTextColor="#52525b"
                                />
                            </View>
                        </View>

                        {/* Categoria */}
                        <View className="mb-3.5">
                            <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                                Categoria (Opcional)
                            </Text>
                            <TextInput
                                value={category}
                                onChangeText={setCategory}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-medium"
                                placeholder="Ex: Bebidas, Limpeza"
                                placeholderTextColor="#52525b"
                            />
                        </View>

                        {/* Seletor de Imagem */}
                        <View className="mb-4">
                            <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                                Imagem do Produto (Opcional)
                            </Text>
                            <TouchableOpacity
                                onPress={pickImage}
                                className="w-full py-3 px-4 rounded-xl bg-zinc-950 border border-zinc-800 items-center justify-center flex-row gap-2 active:bg-zinc-800"
                            >
                                <ImageIcon size={16} color="#38bdf8" />
                                <Text className="text-sm font-semibold text-cyan-400">
                                    {imageFile ? 'Alterar Imagem' : 'Selecionar Imagem da Galeria'}
                                </Text>
                            </TouchableOpacity>

                            {imageFile && (
                                <View className="mt-3 items-center">
                                    <View className="w-20 h-20 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 items-center justify-center">
                                        <Image source={{ uri: imageFile.uri }} className="w-full h-full" resizeMode="cover" />
                                    </View>
                                </View>
                            )}
                        </View>

                    </ScrollView>

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
                            onPress={handleSubmit}
                            disabled={loading}
                            className="flex-1 py-3 bg-blue-600 rounded-xl items-center flex-row justify-center gap-1.5 opacity-90 active:opacity-100 disabled:opacity-30"
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text className="text-white font-semibold text-xs">Salvar Produto</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
}