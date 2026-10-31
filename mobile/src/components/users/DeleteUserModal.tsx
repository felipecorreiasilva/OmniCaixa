import { userService } from '@/services/userService';
import { User } from '@/types/user';
import { AlertTriangle, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: User | null;
}

export default function DeleteUserModal({ isOpen, onClose, onSuccess, user }: DeleteUserModalProps) {
    const [loading, setLoading] = useState(false);

    if (!isOpen || !user) return null;

    async function handleDelete() {
        if (!user?.id) return;

        try {
            setLoading(true);
            await userService.deleteUser(user.id);
            onSuccess();
        } catch (err) {
            console.error('Erro ao excluir o utilizador:', err);
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
                    
                    {/* Cabeçalho */}
                    <View className="flex-row justify-between items-center px-6 py-4 bg-zinc-950 border-b border-zinc-800">
                        <View className="flex-row items-center gap-2">
                            <AlertTriangle size={20} color="#f87171" />
                            <Text className="text-red-400 font-bold text-base">Excluir Funcionário</Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className="p-1.5 bg-zinc-900 rounded-lg"
                        >
                            <X size={18} color="#a1a1aa" />
                        </TouchableOpacity>
                    </View>

                    {/* Conteúdo */}
                    <View className="p-6 items-center space-y-3">
                        <View className="flex items-center justify-center h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 mb-2">
                            <AlertTriangle size={28} color="#f87171" />
                        </View>

                        <Text className="text-lg font-bold text-white text-center">Tem certeza absoluta?</Text>
                        
                        <Text className="text-xs text-zinc-400 leading-relaxed text-center px-2">
                            Esta ação irá remover permanentemente o utilizador <Text className="font-semibold text-zinc-200">"{user.name}"</Text> do sistema. Esta ação não poderá ser desfeita.
                        </Text>
                    </View>

                    {/* Rodapé / Ações */}
                    <View className="p-4 bg-zinc-950 border-t border-zinc-800 flex-row gap-2">
                        <TouchableOpacity
                            onPress={onClose}
                            disabled={loading}
                            className="flex-1 py-3 items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800"
                        >
                            <Text className="text-xs font-semibold text-zinc-300">Cancelar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            disabled={loading}
                            onPress={handleDelete}
                            className="flex-1 py-3 bg-red-600 rounded-xl flex-row items-center justify-center gap-1.5 opacity-90"
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