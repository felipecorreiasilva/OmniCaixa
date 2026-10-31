'use client';

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { Users as UsersIcon, Shield, UserPlus, Mail, Trash2, Edit, Search, CircleUserRound } from "lucide-react";
import { userService } from "@/services/userService";
import { User } from "@/types/user";
import CreateUserModal from "@/components/users/CreateUserModal";
import EditUserModal from "@/components/users/EditUserModal";
import DeleteUserModal from "@/components/users/DeleteUserModal";
import { useAuth } from "@/context/AuthContext";
import { tokenService } from "@/services/tokenService";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); // Estado para a pesquisa
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const { user } = useAuth();

    // Carregar utilizadores da API ao montar o componente com validação de token
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!tokenService.isTokenValid(token)) {
            localStorage.removeItem('token');
            router.push('/login');
            return;
        }

        if (user && (user.role === 'admin' || user.role === 'manager')) {
            loadUsers();
        }
    }, [user, router]);

    async function loadUsers() {
        try {
            setLoadingUsers(true);
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Erro ao carregar utilizadores:", error);
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
        <ProtectedRoute allowedRoles={['admin','manager']}>
            <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    
                    {/* Cabeçalho da Página */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
                                <UsersIcon className="w-7 h-7 text-cyan-400" />
                                Gestão de Funcionários
                            </h1>
                            <p className="text-sm text-zinc-400 mt-1">
                                Administre as contas de acesso, cargos e permissões do sistema.
                            </p>
                        </div>

                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
                        >
                            <UserPlus size={18} />
                            Novo Utilizador
                        </button>
                    </div>

                    {/* Barra de Pesquisa */}
                    <div className="relative w-full sm:w-96">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Pesquisar por nome, email ou cargo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm transition"
                        />
                    </div>

                    {/* Conteúdo dinâmico: Tabela (Desktop) ou Cards (Mobile) */}
                    {loadingUsers ? (
                        <div className="py-12 text-center text-zinc-500 text-sm bg-zinc-900 rounded-3xl border border-zinc-800 shadow-sm">
                            A carregar utilizadores...
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="py-12 text-center text-zinc-500 bg-zinc-900 rounded-3xl border border-zinc-800 shadow-sm">
                            Nenhum utilizador encontrado para "{searchTerm}".
                        </div>
                    ) : (
                        <>
                            {/* 1. VISÃO EM TABELA (Apenas para telas médias e grandes - Desktop) */}
                            <div className="hidden md:block bg-zinc-900 rounded-3xl border border-zinc-800 shadow-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-zinc-950 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                                <th className="py-4 px-6">Foto</th>
                                                <th className="py-4 px-6">Funcionário</th>
                                                <th className="py-4 px-6">Email</th>
                                                <th className="py-4 px-6">Cargo (Role)</th>
                                                <th className="py-4 px-6 text-center">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800 text-sm text-zinc-300">
                                            {filteredUsers.map((u) => (
                                                <tr key={u.id} className="hover:bg-zinc-800/50 transition">
                                                    {/* Coluna 0: Foto */}
                                                    <td className="py-4 px-6">
                                                        <div className="w-10 h-10 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 flex items-center justify-center shrink-0 relative">
                                                            {u.image_url && u.image_url.trim() !== "" ? (
                                                                <img 
                                                                    src={`${API_URL}${u.image_url}`} 
                                                                    alt={u.name} 
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                        const fallback = e.currentTarget.nextElementSibling;
                                                                        if (fallback) {
                                                                            (fallback as HTMLElement).style.display = 'flex';
                                                                        }
                                                                    }}
                                                                />
                                                            ) : null}

                                                            <div 
                                                                className="absolute inset-0 flex items-center justify-center bg-zinc-950" 
                                                                style={{ display: (u.image_url && u.image_url.trim() !== "") ? 'none' : 'flex' }}
                                                            >
                                                                <CircleUserRound size={20} className="text-zinc-600" />
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Coluna 1: Nome */}
                                                    <td className="py-4 px-6">
                                                        <span className="font-semibold text-white">{u.name}</span>
                                                    </td>

                                                    {/* Coluna 2: Email */}
                                                    <td className="py-4 px-6 text-zinc-400">
                                                        <div className="flex items-center gap-2">
                                                            <Mail size={14} className="text-zinc-500 shrink-0" />
                                                            <span>{u.email}</span>
                                                        </div>
                                                    </td>

                                                    {/* Coluna 3: Cargo */}
                                                    <td className="py-4 px-6">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
                                                            u.role === 'admin' 
                                                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                                                : u.role === 'manager' 
                                                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        }`}>
                                                            <Shield size={12} />
                                                            {u.role}
                                                        </span>
                                                    </td>

                                                    {/* Coluna 4: Ações */}
                                                    <td className="py-4 px-6 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button 
                                                                type="button"
                                                                title="Editar"
                                                                onClick={() => setEditingUser(u)}
                                                                className="cursor-pointer bg-zinc-950 text-cyan-400 hover:text-cyan-300 p-2 rounded-xl border border-zinc-800 transition"
                                                            >
                                                                <Edit size={16} />
                                                            </button>

                                                            {user?.role === 'admin' && (
                                                                <button 
                                                                    type="button"
                                                                    title="Eliminar"
                                                                    onClick={() => setDeletingUser(u)}
                                                                    className="cursor-pointer bg-zinc-950 text-red-400 hover:text-red-300 p-2 rounded-xl border border-zinc-800 transition"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 2. VISÃO EM CARDS (Apenas para telas pequenas - Telemóveis) */}
                            <div className="grid grid-cols-1 gap-3 md:hidden">
                                {filteredUsers.map((u) => (
                                    <div 
                                        key={u.id} 
                                        className="bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-800 flex flex-col justify-between gap-3"
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-12 h-12 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800 flex items-center justify-center shrink-0 relative">
                                                    {u.image_url && u.image_url.trim() !== "" ? (
                                                        <img 
                                                            src={`${API_URL}${u.image_url}`} 
                                                            alt={u.name} 
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                const fallback = e.currentTarget.nextElementSibling;
                                                                if (fallback) {
                                                                    (fallback as HTMLElement).style.display = 'flex';
                                                                }
                                                            }}
                                                        />
                                                    ) : null}

                                                    <div 
                                                        className="absolute inset-0 flex items-center justify-center bg-zinc-950" 
                                                        style={{ display: (u.image_url && u.image_url.trim() !== "") ? 'none' : 'flex' }}
                                                    >
                                                        <CircleUserRound size={22} className="text-zinc-600" />
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-white text-sm truncate">{u.name}</h3>
                                                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs mt-0.5 truncate">
                                                        <Mail size={13} className="shrink-0 text-zinc-500" />
                                                        <span className="truncate">{u.email}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border shrink-0 ${
                                                u.role === 'admin' 
                                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                                    : u.role === 'manager' 
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            }`}>
                                                <Shield size={10} />
                                                {u.role}
                                            </span>
                                        </div>

                                        <div className="flex justify-end items-center pt-2.5 border-t border-zinc-800 gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => setEditingUser(u)}
                                                className="cursor-pointer bg-zinc-950 text-cyan-400 hover:text-cyan-300 p-2.5 rounded-xl border border-zinc-800 transition"
                                                title="Editar"
                                            >
                                                <Edit size={16} />
                                            </button>

                                            {user?.role === 'admin' && (
                                                <button 
                                                    type="button"
                                                    onClick={() => setDeletingUser(u)}
                                                    className="cursor-pointer bg-zinc-950 text-red-400 hover:text-red-300 p-2.5 rounded-xl border border-zinc-800 transition"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <CreateUserModal 
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSuccess={() => {
                            setIsModalOpen(false);
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
                </div>
            </div>
        </ProtectedRoute>
    );
}