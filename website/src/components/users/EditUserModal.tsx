'use client';

import { userService } from "@/services/userService";
import { User } from "@/types/user";
import { useEffect, useState } from "react";
import { X, UserCheck, Mail, User as UserIcon, Shield, Image as ImageIcon, Lock } from "lucide-react";

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
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setRole(user.role || 'cashier');
            setPassword(''); 
            setFile(null);
            setError('');
        }       
    }, [user]);

    if (!isOpen || !user) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
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

            // SÓ adiciona ao FormData se o utilizador realmente escolheu um NOVO ficheiro.
            // Se 'file' for null, o campo não é enviado, preservando a imagem antiga no backend.
            if (file) {
                formData.append('image_url', file);
            }

            if (!user?.id) return;
            
            await userService.updateUser(user.id, formData);

            onSuccess(); // Chama o sucesso (que atualiza a lista e pode fechar o modal na página principal)
        } catch (err: any) {
            console.error('Erro ao atualizar utilizador:', err);
            setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao atualizar utilizador. Tenta novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
                
                {/* Cabeçalho do Modal */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                        <UserCheck className="w-5 h-5 text-cyan-600" />
                        <h2>Editar Funcionário</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Formulário */}
                <form className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Nome */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Nome Completo
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <UserIcon size={16} />
                            </span>
                            <input 
                                type="text" 
                                required
                                placeholder="Ex: João Silva"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 transition"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Email Profissional
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <Mail size={16} />
                            </span>
                            <input 
                                type="email" 
                                required
                                placeholder="exemplo@omnicaixa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 transition"
                            />
                        </div>
                    </div>

                    {/* Palavra-passe */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Nova Palavra-passe (Opcional)
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <Lock size={16} />
                            </span>
                            <input 
                                type="password" 
                                placeholder="Deixe em branco para manter a atual"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 transition"
                            />
                        </div>
                    </div>

                    {/* Cargo / Role */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Cargo (Permissão)
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <Shield size={16} />
                            </span>

                            {role === 'admin' ? (
                                <select 
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as any)}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 transition text-gray-700"
                                >
                                    <option value="cashier">Caixa (Cashier)</option>
                                    <option value="manager">Gerente (Manager)</option>
                                    <option value="admin">Administrador (Admin)</option>
                                </select>
                            ) : (
                                <div className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-100 border border-gray-200 rounded-xl text-gray-500 flex items-center justify-between cursor-not-allowed select-none">
                                    <span className="capitalize">
                                        {{
                                            admin: 'Administrador (Admin)',
                                            manager: 'Gerente (Manager)',
                                            cashier: 'Caixa (Cashier)'
                                        }[role] || 'Caixa (Cashier)'}
                                    </span>
                                    <span className="text-xs text-gray-400 italic">Apenas administradores podem alterar</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload da Nova Foto de Perfil */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Atualizar Foto de Perfil (Opcional)
                        </label>
                        <div className="flex items-center gap-2">
                            <label className="w-full flex items-center gap-2 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition text-gray-500">
                                <ImageIcon size={16} className="text-gray-400 shrink-0" />
                                <span className="truncate">
                                    {file ? file.name : "Escolher nova imagem..."}
                                </span>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setFile(e.target.files[0]);
                                        }
                                    }}
                                    className="hidden"
                                />
                            </label>
                            {file && (
                                <button
                                    type="button"
                                    onClick={() => setFile(null)}
                                    className="text-xs text-red-500 hover:underline px-2 py-1 shrink-0"
                                >
                                    Remover
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-5 py-2 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? 'A atualizar...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}