'use client';

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { Users as UsersIcon, Shield, UserPlus, Mail, Trash2, Edit } from "lucide-react";
import { userService } from "@/services/userService";
import { User } from "@/types/user";
import CreateUserModal from "@/components/users/CreateUserModal";
import EditUserModal from "@/components/users/EditUserModal";
import DeleteUserModal from "@/components/users/DeleteUserModal";

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [deletingUser, setDeletingUser] = useState<User | null>(null)
    // Carregar utilizadores da API ao montar o componente
    useEffect(() => {
        loadUsers();
    }, []);

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
    return (
        <ProtectedRoute allowedRoles={['admin','manager']}>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Cabeçalho da Página */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
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
                        className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
                    >
                        <UserPlus size={18} />
                        Novo Utilizador
                    </button>
                </div>

                {/* Tabela ou Lista de Utilizadores */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
                                {loadingUsers ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-500">
                                            A carregar utilizadores...
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-500">
                                            Nenhum utilizador encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u) => (
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <CreateUserModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false)
                    loadUsers()
                    }  
                }
                />

                <EditUserModal 
                isOpen={!!editingUser}
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onSuccess={() => {
                    setEditingUser(null)
                    loadUsers()
                    }   
                }
                />

                <DeleteUserModal
                isOpen={!!deletingUser}
                user={deletingUser}
                onClose={() => setDeletingUser(null)}
                onSuccess={() => {
                    setDeletingUser(null)
                    loadUsers()
                }}
                />
            </div>
        </ProtectedRoute>
    );
}