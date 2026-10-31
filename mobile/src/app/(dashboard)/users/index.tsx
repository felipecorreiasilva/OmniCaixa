import { useAuth } from '@/context/AuthContext';
import { tokenService } from '@/services/tokenService';
import { userService } from '@/services/userService';
import { User } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { CircleUserRound, Edit, Mail, Search, Shield, Trash2, UserPlus, Users as UsersIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

import CreateUserModal from '@/components/users/CreateUserModal';
import DeleteUserModal from '@/components/users/DeleteUserModal';
import EditUserModal from '@/components/users/EditUserModal';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333';

export default function UsersScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Estados para controlo dos modais
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    // Carregar utilizadores ao montar o componente com validação de token via AsyncStorage
    useEffect(() => {
        async function checkAuthAndLoadUsers() {
            try {
                const token = await AsyncStorage.getItem('token');

                if (!tokenService.isTokenValid(token)) {
                    await AsyncStorage.removeItem('token');
                    router.replace('/login');
                    return;
                }

                if (user && (user.role === 'admin' || user.role === 'manager')) {
                    loadUsers();
                }
            } catch (error) {
                console.error('Erro na autenticação ou carregamento de utilizadores:', error);
            }
        }

        checkAuthAndLoadUsers();
    }, [user, router]);

    async function loadUsers() {
        try {
            setLoadingUsers(true);
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Erro ao carregar utilizadores:', error);
        } finally {
            setLoadingUsers(false);
        }
    }

    // Filtra os utilizadores com base no nome, email ou cargo
    const filteredUsers = users.filter((u) => {
        const term = searchTerm.toLowerCase();
        const matchesName = u.name ? u.name.toLowerCase().includes(term) : false;
        const matchesEmail = u.email ? u.email.toLowerCase().includes(term) : false;
        const matchesRole = u.role ? u.role.toLowerCase().includes(term) : false;

        return matchesName || matchesEmail || matchesRole;
    });

    return (
        <View className="flex-1 bg-zinc-950 p-4">
            <View className="max-w-7xl mx-auto w-full space-y-6 pt-6 flex-1">
                
                {/* Cabeçalho da Página */}
                <View className="flex-row items-center justify-between gap-4">
                    <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                            <UsersIcon size={26} color="#22d3ee" />
                            <Text className="text-2xl font-bold text-white tracking-tight">
                                Gestão de Funcionários
                            </Text>
                        </View>
                        <Text className="text-xs text-zinc-400 mt-1">
                            Administre as contas de acesso, cargos e permissões do sistema.
                        </Text>
                    </View>

                    <TouchableOpacity 
                        onPress={() => setIsCreateModalOpen(true)}
                        className="flex-row items-center justify-center gap-2 bg-cyan-600 active:bg-cyan-700 px-4 py-2.5 rounded-xl shadow-sm"
                    >
                        <UserPlus size={18} color="#ffffff" />
                        <Text className="text-white text-xs font-semibold">Novo</Text>
                    </TouchableOpacity>
                </View>

                {/* Barra de Pesquisa */}
                <View className="relative w-full">
                    <View className="absolute inset-y-0 left-0 pl-3.5 justify-center z-10">
                        <Search size={18} color="#71717a" />
                    </View>
                    <TextInput
                        placeholder="Pesquisar por nome, email ou cargo..."
                        placeholderTextColor="#71717a"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white"
                    />
                </View>

                {/* Conteúdo Dinâmico com FlatList */}
                {loadingUsers ? (
                    <View className="py-12 items-center justify-center bg-zinc-900 rounded-3xl border border-zinc-800">
                        <ActivityIndicator size="small" color="#22d3ee" />
                        <Text className="text-zinc-500 text-xs mt-2">A carregar utilizadores...</Text>
                    </View>
                ) : filteredUsers.length === 0 ? (
                    <View className="py-12 items-center justify-center bg-zinc-900 rounded-3xl border border-zinc-800 px-4">
                        <Text className="text-zinc-500 text-xs text-center">
                            Nenhum utilizador encontrado para "{searchTerm}".
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredUsers}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        renderItem={({ item: u }) => (
                            <View className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-3 flex-col justify-between gap-3">
                                <View className="flex-row justify-between items-start gap-3">
                                    <View className="flex-row items-center gap-3 flex-1 min-w-0">
                                        <View className="w-12 h-12 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800 items-center justify-center relative">
                                            {u.image_url && u.image_url.trim() !== "" ? (
                                                <Image 
                                                    source={{ uri: `${API_URL}${u.image_url}` }} 
                                                    className="w-full h-full"
                                                />
                                            ) : (
                                                <CircleUserRound size={22} color="#52525b" />
                                            )}
                                        </View>
                                        <View className="flex-1 min-w-0">
                                            <Text className="font-bold text-white text-sm truncate">{u.name}</Text>
                                            <View className="flex-row items-center gap-1.5 mt-0.5">
                                                <Mail size={13} color="#71717a" />
                                                <Text className="text-zinc-400 text-xs truncate">{u.email}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View className={`flex-row items-center gap-1 px-2.5 py-0.5 rounded-full border ${
                                        u.role === 'admin' 
                                            ? 'bg-purple-500/10 border-purple-500/20' 
                                            : u.role === 'manager' 
                                            ? 'bg-blue-500/10 border-blue-500/20' 
                                            : 'bg-emerald-500/10 border-emerald-500/20'
                                    }`}>
                                        <Shield size={10} color={
                                            u.role === 'admin' ? '#c084fc' : u.role === 'manager' ? '#60a5fa' : '#34d399'
                                        } />
                                        <Text className={`text-[10px] font-semibold uppercase tracking-wider ${
                                            u.role === 'admin' ? 'text-purple-400' : u.role === 'manager' ? 'text-blue-400' : 'text-emerald-400'
                                        }`}>
                                            {u.role}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-end items-center pt-2.5 border-t border-zinc-800 gap-2">
                                    <TouchableOpacity 
                                        onPress={() => setEditingUser(u)}
                                        className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800"
                                    >
                                        <Edit size={16} color="#22d3ee" />
                                    </TouchableOpacity>

                                    {user?.role === 'admin' && (
                                        <TouchableOpacity 
                                            onPress={() => setDeletingUser(u)}
                                            className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800"
                                        >
                                            <Trash2 size={16} color="#f87171" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        )}
                    />
                )}

                {/* Modais de Gestão */}
                <CreateUserModal 
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        loadUsers();
                    }}
                />

                <EditUserModal 
                    isOpen={!!editingUser}
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSuccess={() => {
                        setEditingUser(null);
                        loadUsers();
                    }}
                />

                <DeleteUserModal
                    isOpen={!!deletingUser}
                    user={deletingUser}
                    onClose={() => setDeletingUser(null)}
                    onSuccess={() => {
                        setDeletingUser(null);
                        loadUsers();
                    }}
                />

            </View>
        </View>
    );
}