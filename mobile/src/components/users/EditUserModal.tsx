import { userService } from '@/services/userService';
import { User } from '@/types/user';
import * as ImagePicker from 'expo-image-picker';
import { CheckCircle, Image as ImageIcon, Lock, Mail, UserCheck, User as UserIcon, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: User | null;
}

export default function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'manager' | 'cashier'>('cashier');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setRole(user.role || 'cashier');
            setPassword('');
            setImageUri(null);
            setError('');
        }
    }, [user]);

    if (!isOpen || !user) return null;

    // Função para selecionar nova imagem no mobile
    async function pickImage() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    }

    async function handleSubmit() {
        setError('');
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('role', role);
            
            if (password.trim()) {
                formData.append('password', password);
            }

            if (imageUri) {
                const filename = imageUri.split('/').pop() || 'profile.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                formData.append('image_url', {
                    uri: imageUri,
                    name: filename,
                    type,
                } as any);
            }

            if (!user?.id) return;
            
            await userService.updateUser(user.id, formData);

            onSuccess();
        } catch (err: any) {
            console.error('Erro ao atualizar utilizador:', err);
            setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao atualizar utilizador. Tenta novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            visible={isOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/70 p-4">
                <View className="bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden my-auto">
                    
                    {/* Cabeçalho do Modal */}
                    <View className="flex-row items-center justify-between px-6 py-4 bg-zinc-950 border-b border-zinc-800">
                        <View className="flex-row items-center gap-2">
                            <UserCheck size={20} color="#22d3ee" />
                            <Text className="text-cyan-400 font-bold text-base">Editar Funcionário</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={onClose}
                            className="p-1.5 bg-zinc-900 rounded-lg"
                        >
                            <X size={18} color="#a1a1aa" />
                        </TouchableOpacity>
                    </View>

                    {/* Formulário */}
                    <ScrollView className="p-6 space-y-4 max-h-[75vh]" showsVerticalScrollIndicator={false}>
                        {error ? (
                            <View className="bg-red-500/10 p-3 rounded-2xl border border-red-500/20 mb-3">
                                <Text className="text-red-400 text-xs">{error}</Text>
                            </View>
                        ) : null}

                        {/* Nome */}
                        <View className="space-y-1.5 mb-3">
                            <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Nome Completo *
                            </Text>
                            <View className="relative flex-row items-center">
                                <View className="absolute left-4 z-10">
                                    <UserIcon size={16} color="#71717a" />
                                </View>
                                <TextInput 
                                    placeholder="Ex: João Silva"
                                    placeholderTextColor="#52525b"
                                    value={name}
                                    onChangeText={setName}
                                    className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-medium"
                                />
                            </View>
                        </View>

                        {/* Email */}
                        <View className="space-y-1.5 mb-3">
                            <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Email Profissional *
                            </Text>
                            <View className="relative flex-row items-center">
                                <View className="absolute left-4 z-10">
                                    <Mail size={16} color="#71717a" />
                                </View>
                                <TextInput 
                                    placeholder="exemplo@omnicaixa.com"
                                    placeholderTextColor="#52525b"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-medium"
                                />
                            </View>
                        </View>

                        {/* Palavra-passe */}
                        <View className="space-y-1.5 mb-3">
                            <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Nova Palavra-passe (Opcional)
                            </Text>
                            <View className="relative flex-row items-center">
                                <View className="absolute left-4 z-10">
                                    <Lock size={16} color="#71717a" />
                                </View>
                                <TextInput 
                                    placeholder="Deixe em branco para manter a atual"
                                    placeholderTextColor="#52525b"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                    className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-medium"
                                />
                            </View>
                        </View>

                        {/* Cargo / Role */}
                        <View className="space-y-1.5 mb-3">
                            <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                                Cargo (Permissão) *
                            </Text>
                            {role === 'admin' ? (
                                <View className="flex-row gap-2">
                                    {(['cashier', 'manager', 'admin'] as const).map((r) => (
                                        <TouchableOpacity
                                            key={r}
                                            onPress={() => setRole(r)}
                                            className={`flex-1 py-2.5 rounded-xl border items-center ${
                                                role === r 
                                                    ? 'bg-cyan-600/20 border-cyan-500 text-white' 
                                                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                                            }`}
                                        >
                                            <Text className={`text-xs font-semibold capitalize ${role === r ? 'text-cyan-400' : 'text-zinc-400'}`}>
                                                {r === 'cashier' ? 'Caixa' : r === 'manager' ? 'Gerente' : 'Admin'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ) : (
                                <View className="w-full pl-4 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl flex-row items-center justify-between">
                                    <Text className="text-zinc-400 text-sm capitalize">
                                        {{
                                            admin: 'Administrador (Admin)',
                                            manager: 'Gerente (Manager)',
                                            cashier: 'Caixa (Cashier)'
                                        }[role] || 'Caixa (Cashier)'}
                                    </Text>
                                    <Text className="text-[10px] text-zinc-500 italic">Apenas admins podem alterar</Text>
                                </View>
                            )}
                        </View>

                        {/* Upload da Nova Foto de Perfil */}
                        <View className="space-y-1.5 mb-4">
                            <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Atualizar Foto de Perfil (Opcional)
                            </Text>
                            <View className="flex-row items-center gap-2">
                                <TouchableOpacity 
                                    onPress={pickImage}
                                    className="flex-1 py-3 px-4 bg-zinc-950 border border-zinc-800 rounded-xl flex-row items-center gap-2.5"
                                >
                                    <ImageIcon size={16} color="#22d3ee" />
                                    <Text className="text-xs font-semibold text-zinc-300 truncate">
                                        {imageUri ? 'Nova imagem selecionada' : 'Escolher nova imagem...'}
                                    </Text>
                                </TouchableOpacity>
                                {imageUri && (
                                    <TouchableOpacity
                                        onPress={() => setImageUri(null)}
                                        className="px-3 py-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                                    >
                                        <Text className="text-xs text-red-400 font-semibold">Remover</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Botões de Ação */}
                        <View className="pt-2 flex-row gap-2 mb-2">
                            <TouchableOpacity 
                                onPress={onClose}
                                className="flex-1 py-3 items-center justify-center bg-zinc-950 rounded-xl border border-zinc-800"
                            >
                                <Text className="text-xs font-semibold text-zinc-300">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={handleSubmit}
                                disabled={loading}
                                className="flex-1 py-3 bg-cyan-600 rounded-xl flex-row items-center justify-center gap-1.5 opacity-90"
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <>
                                        <CheckCircle size={16} color="#ffffff" />
                                        <Text className="text-white font-semibold text-xs">Salvar Alterações</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                </View>
            </View>
        </Modal>
    );
}