'use client';

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { Users as UsersIcon, Shield, UserPlus, Mail, Trash2, Edit, Search } from "lucide-react";
import { userService } from "@/services/userService";
import { User } from "@/types/user";
import CreateUserModal from "@/components/users/CreateUserModal";
import EditUserModal from "@/components/users/EditUserModal";
import DeleteUserModal from "@/components/users/DeleteUserModal";
import { useAuth } from "@/context/AuthContext";

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); // Estado para a pesquisa
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const { user } = useAuth();

    // Carregar utilizadores da API ao montar o componente
    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'manager')) {
            loadUsers();
        }
    }, [user]);

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
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                
                {/* Cabeçalho da Página */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <UsersIcon className="w-7 h-7 text-cyan-600" />
                            Gestão de Funcionários
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Administre as contas de acesso, cargos e permissões do sistema.
                        </p>
                    </div>

                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm cursor-pointer"
                    >
                        <UserPlus size={18} />
                        Novo Utilizador
                    </button>
                </div>

                {/* Barra de Pesquisa */}
                <div className="relative w-full sm:w-96">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <Search size={18} />
                    </span>
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, email ou cargo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm transition"
                    />
                </div>

                {/* Conteúdo dinâmico: Tabela (Desktop) ou Cards (Mobile) */}
                {loadingUsers ? (
                    <div className="py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        A carregar utilizadores...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        Nenhum utilizador encontrado para "{searchTerm}".
                    </div>
                ) : (
                    <>
                        {/* 1. VISÃO EM TABELA (Apenas para telas médias e grandes - Desktop) */}
                        <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            <th className="py-4 px-6">Funcionário</th>
                                            <th className="py-4 px-6">Email</th>
                                            <th className="py-4 px-6">Cargo (Role)</th>
                                            <th className="py-4 px-6 text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 text-sm">
                                        {filteredUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50/50 transition">
                                                {/* Coluna 1: Nome com Avatar */}
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold shrink-0">
                                                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                                        </div>
                                                        <span className="font-medium text-gray-900">{u.name}</span>
                                                    </div>
                                                </td>

                                                {/* Coluna 2: Email */}
                                                <td className="py-4 px-6 text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Mail size={14} className="text-gray-400 shrink-0" />
                                                        <span>{u.email}</span>
                                                    </div>
                                                </td>

                                                {/* Coluna 3: Cargo */}
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                                        u.role === 'admin' 
                                                            ? 'bg-purple-100 text-purple-700' 
                                                            : u.role === 'manager' 
                                                            ? 'bg-blue-100 text-blue-700' 
                                                            : 'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                        <Shield size={12} />
                                                        {u.role}
                                                    </span>
                                                </td>

                                                {/* Coluna 4: Ações (Centralizadas) */}
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button 
                                                            title="Editar"
                                                            onClick={() => setEditingUser(u)}
                                                            className="cursor-pointer p-2 text-cyan-600 hover:text-cyan-800 hover:bg-cyan-50 rounded-lg transition"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button 
                                                            title="Eliminar"
                                                            onClick={() => setDeletingUser(u)}
                                                            className="cursor-pointer p-2 text-red-600 hover:text-red-800 hover:bg-red-50/50 rounded-lg transition"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 2. VISÃO EM CARDS (Apenas para telas pequenas - Telemóveis) */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {filteredUsers.map((u) => (
                                <div 
                                    key={u.id} 
                                    className="bg-white p-4 rounded-2xl shadow-md border-2 border-slate-300 flex flex-col justify-between gap-3"
                                >
                                    {/* Linha superior: Avatar, Nome e Cargo */}
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold shrink-0 text-base">
                                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-slate-900 text-base truncate">{u.name}</h3>
                                                <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5 truncate">
                                                    <Mail size={13} className="shrink-0 text-slate-400" />
                                                    <span className="truncate">{u.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Badge de Cargo */}
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider shrink-0 ${
                                            u.role === 'admin' 
                                                ? 'bg-purple-100 text-purple-700' 
                                                : u.role === 'manager' 
                                                ? 'bg-blue-100 text-blue-700' 
                                                : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            <Shield size={11} />
                                            {u.role}
                                        </span>
                                    </div>

                                    {/* Linha inferior: Ações de Editar / Excluir */}
                                    <div className="flex justify-end items-center pt-3 border-t border-slate-200 gap-2">
                                        <button 
                                            onClick={() => setEditingUser(u)}
                                            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition text-xs font-medium border border-cyan-200"
                                            title="Editar"
                                        >
                                            <Edit size={14} /> Editar
                                        </button>
                                        <button 
                                            onClick={() => setDeletingUser(u)}
                                            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs font-medium border border-red-200"
                                            title="Excluir"
                                        >
                                            <Trash2 size={14} /> Excluir
                                        </button>
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
        </ProtectedRoute>
    );
}