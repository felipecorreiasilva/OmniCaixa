'use client';

import { userService } from "@/services/userService";
import { User } from "@/types/user";
import { useEffect, useState } from "react";
import { X, UserCheck, Mail, User as UserIcon, Shield, Image as ImageIcon, Lock, CheckCircle } from "lucide-react";

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
            if (file) {
                formData.append('image_url', file);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-zinc-900 w-full max-w-md mx-auto rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
                
                {/* Cabeçalho do Modal */}
                <div className="flex items-center justify-between px-6 py-4 bg-zinc-950 border-b border-zinc-800">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
                        <UserCheck size={20} />
                        <h2>Editar Funcionário</h2>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white p-1.5 bg-zinc-900 rounded-lg transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    {error && (
                        <div className="bg-red-500/10 text-red-400 text-xs p-3 rounded-2xl border border-red-500/20">
                            {error}
                        </div>
                    )}

                    {/* Nome */}
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                            Nome Completo *
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-zinc-500 z-10">
                                <UserIcon size={16} />
                            </span>
                            <input 
                                type="text" 
                                required
                                placeholder="Ex: João Silva"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-medium placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                            Email Profissional *
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-zinc-500 z-10">
                                <Mail size={16} />
                            </span>
                            <input 
                                type="email" 
                                required
                                placeholder="exemplo@omnicaixa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-medium placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Palavra-passe */}
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                            Nova Palavra-passe (Opcional)
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-zinc-500 z-10">
                                <Lock size={16} />
                            </span>
                            <input 
                                type="password" 
                                placeholder="Deixe em branco para manter a atual"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-medium placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Cargo / Role */}
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                            Cargo (Permissão) *
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-zinc-500 z-10">
                                <Shield size={16} />
                            </span>

                            {role === 'admin' ? (
                                <select 
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as any)}
                                    className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm appearance-none cursor-pointer"
                                >
                                    <option value="cashier" className="bg-zinc-900 text-white">Caixa (Cashier)</option>
                                    <option value="manager" className="bg-zinc-900 text-white">Gerente (Manager)</option>
                                    <option value="admin" className="bg-zinc-900 text-white">Administrador (Admin)</option>
                                </select>
                            ) : (
                                <div className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-400 text-sm flex items-center justify-between cursor-not-allowed select-none">
                                    <span className="capitalize">
                                        {{
                                            admin: 'Administrador (Admin)',
                                            manager: 'Gerente (Manager)',
                                            cashier: 'Caixa (Cashier)'
                                        }[role] || 'Caixa (Cashier)'}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 italic">Apenas admins podem alterar</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload da Nova Foto de Perfil */}
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                            Atualizar Foto de Perfil (Opcional)
                        </label>
                        <div className="flex items-center gap-2">
                            <label className="w-full py-3 px-4 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 transition flex items-center gap-2.5 cursor-pointer truncate">
                                <ImageIcon size={16} className="text-cyan-400 shrink-0" />
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
                                    className="text-xs text-red-400 hover:text-red-300 px-2.5 py-2 bg-red-500/10 border border-red-500/20 rounded-xl shrink-0 transition cursor-pointer"
                                >
                                    Remover
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="pt-2 flex gap-2">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-xs font-semibold text-zinc-300 bg-zinc-950 hover:bg-zinc-800 rounded-xl transition cursor-pointer border border-zinc-800 text-center"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                        >
                            <CheckCircle size={16} />
                            {loading ? 'A atualizar...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}