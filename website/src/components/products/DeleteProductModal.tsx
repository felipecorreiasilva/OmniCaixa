'use client';

import { useState } from 'react';
import { Product } from '@/types/product';
import { productService } from '@/services/productService';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product: Product | null;
}

export default function DeleteProductModal({ isOpen, onClose, onSuccess, product }: DeleteProductModalProps) {
    const [loading, setLoading] = useState(false);

    if (!isOpen || !product) return null;

    async function handleDelete() {
        if (!product?.id) return;

        try {
            setLoading(true);
            await productService.deleteProduct(product.id);
            onSuccess();
        } catch (err) {
            alert('Erro ao excluir o produto.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Cabeçalho */}
                <div className="flex justify-between items-center px-6 py-4 bg-zinc-950 border-b border-zinc-800">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-base">
                        <AlertTriangle size={20} />
                        <span>Excluir Produto</span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white p-1.5 bg-zinc-900 rounded-lg transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="p-6 text-center space-y-3">
                    <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-2">
                        <AlertTriangle size={28} />
                    </div>

                    <h3 className="text-lg font-bold text-white">Tem certeza absoluta?</h3>
                    
                    <p className="text-xs text-zinc-400 leading-relaxed px-2">
                        Esta ação irá remover permanentemente o produto <span className="font-semibold text-zinc-200">"{product.name}"</span> do sistema. Esta ação não poderá ser desfeita.
                    </p>
                </div>

                {/* Rodapé / Ações */}
                <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-3 text-xs font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition cursor-pointer border border-zinc-800 text-center"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleDelete}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                    >
                        {loading ? 'A excluir...' : 'Sim, Excluir'}
                    </button>
                </div>

            </div>
        </div>
    );
}