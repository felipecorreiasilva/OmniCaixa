import { productService } from '@/services/productService'; // Ajusta o caminho conforme a estrutura do teu projeto mobile
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
            <View className="flex-1 bg-black/50 items-center justify-center z-50 px-4">
                <View className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90%]">
                    <Text className="text-xl font-bold mb-4 text-gray-800">Cadastrar Novo Produto</Text>
                    
                    <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
                        {/* Campo de Código de Barras */}
                        <View className="mb-3">
                            <Text className="text-sm font-medium text-gray-700 mb-1">
                                Código de Barras (EAN-13 / Opcional)
                            </Text>
                            <TextInput
                                value={barcode}
                                onChangeText={setBarcode}
                                maxLength={13}
                                keyboardType="numeric"
                                className="text-black w-full border border-gray-300 rounded-lg p-3 text-sm bg-gray-50 focus:border-blue-500"
                                placeholder="Passe o leitor ou digite o código..."
                                placeholderTextColor="#9ca3af"
                            />
                        </View>

                        {/* Nome do Produto */}
                        <View className="mb-3">
                            <Text className="text-sm font-medium text-gray-700 mb-1">Nome do Produto *</Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                className="text-black w-full border border-gray-300 rounded-lg p-3 text-sm bg-gray-50 focus:border-blue-500"
                                placeholder="Ex: Coca-Cola 2L"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>

                        {/* Preço e Estoque */}
                        <View className="flex-row gap-3 mb-3">
                            <View className="flex-1">
                                <Text className="text-sm font-medium text-gray-700 mb-1">Preço (R$) *</Text>
                                <TextInput
                                    value={price}
                                    onChangeText={setPrice}
                                    keyboardType="numeric"
                                    className="text-black w-full border border-gray-300 rounded-lg p-3 text-sm bg-gray-50 focus:border-blue-500"
                                    placeholder="0.00"
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-medium text-gray-700 mb-1">Estoque Inicial *</Text>
                                <TextInput
                                    value={stock}
                                    onChangeText={setStock}
                                    keyboardType="numeric"
                                    className="text-black w-full border border-gray-300 rounded-lg p-3 text-sm bg-gray-50 focus:border-blue-500"
                                    placeholder="10"
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>
                        </View>

                        {/* Categoria */}
                        <View className="mb-3">
                            <Text className="text-sm font-medium text-gray-700 mb-1">Categoria (Opcional)</Text>
                            <TextInput
                                value={category}
                                onChangeText={setCategory}
                                className="text-black w-full border border-gray-300 rounded-lg p-3 text-sm bg-gray-50 focus:border-blue-500"
                                placeholder="Ex: Bebidas, Limpeza"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>

                        {/* Seletor de Imagem */}
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-1">Imagem do Produto (Opcional)</Text>
                            <TouchableOpacity
                                onPress={pickImage}
                                className="w-full py-2.5 px-4 rounded-lg bg-blue-50 border border-blue-200 items-center justify-center"
                            >
                                <Text className="text-sm font-semibold text-blue-700">
                                    {imageFile ? 'Alterar Imagem' : 'Selecionar Imagem da Galeria'}
                                </Text>
                            </TouchableOpacity>

                            {imageFile && (
                                <View className="mt-2 items-center">
                                    <Image source={{ uri: imageFile.uri }} className="w-20 h-20 rounded-lg object-cover" />
                                </View>
                            )}
                        </View>

                        {/* Botões de Ação */}
                        <View className="flex-row justify-end gap-2 mt-4">
                            <TouchableOpacity
                                onPress={onClose}
                                disabled={loading}
                                className="px-4 py-2.5 bg-gray-200 rounded-lg items-center justify-center"
                            >
                                <Text className="text-gray-700 font-medium text-sm">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={loading}
                                className="px-4 py-2.5 bg-blue-600 rounded-lg items-center justify-center flex-row min-w-[120px]"
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text className="text-white font-medium text-sm">Salvar Produto</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}