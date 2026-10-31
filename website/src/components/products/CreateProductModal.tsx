'use client';

import { useState } from 'react';
import { X, CheckCircle, Upload } from 'lucide-react';

interface CreateProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateProductModal({ isOpen, onClose, onSuccess }: CreateProductModalProps) {
    const [barcode, setBarcode] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [category, setCategory] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setLoading(true);
            const formData = new FormData();
            
            if (barcode) formData.append('barcode', barcode);
            formData.append('name', name);
            formData.append('price', price);
            formData.append('stock', stock);
            if (category) formData.append('category', category);
            if (imageFile) formData.append('image', imageFile);

            const { productService } = await import('@/services/productService');
            await productService.createProduct(formData);

            // Limpa o formulário após o sucesso
            setBarcode('');
            setName('');
            setPrice('');
            setStock('');
            setCategory('');
            setImageFile(null);

            onSuccess();
        } catch (err) {
            alert('Erro ao cadastrar produto. Verifique as permissões (RBAC).');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
                
                {/* Cabeçalho */}
                <div className="flex justify-between items-center px-6 py-4 bg-zinc-950 border-b border-zinc-800">
                    <div className="flex items-center gap-2 text-white font-bold text-base">
                        <span>Cadastrar Novo Produto</span>
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
                    
                    {/* Código de Barras */}
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                            Código de Barras (EAN-13 / Opcional)
                        </label>
                        <input
                            type="text"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            maxLength={13}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-medium placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm"
                            placeholder="Passe o leitor ou digite o código..."
                        />
                    </div>

                    {/* Nome do Produto */}
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                            Nome do Produto *
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-medium placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm"
                            placeholder="Ex: Coca-Cola 2L"
                        />
                    </div>

                    {/* Preço e Estoque */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Preço (R$) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-medium placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Estoque Inicial *
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                required
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-medium placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm"
                                placeholder="10"
                            />
                        </div>
                    </div>

                    {/* Categoria */}
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                            Categoria (Opcional)
                        </label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-medium placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm"
                            placeholder="Ex: Bebidas, Limpeza"
                        />
                    </div>

                    {/* Imagem do Produto */}
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                            Imagem do Produto (Opcional)
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                id="product-image-file"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setImageFile(e.target.files[0]);
                                    }
                                }}
                                className="hidden"
                            />
                            <label 
                                htmlFor="product-image-file"
                                className="w-full py-3 px-4 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Upload size={16} className="text-cyan-400" />
                                {imageFile ? imageFile.name : 'Selecionar Imagem do Computador'}
                            </label>
                        </div>
                    </div>

                    {/* Rodapé / Ações */}
                    <div className="pt-2 flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
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
                            {loading ? 'A salvar...' : 'Salvar Produto'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}