'use client';

import { productService } from "@/services/productService";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import { X, CheckCircle, Upload, Edit3 } from "lucide-react";

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product: Product | null;
}

export default function EditProductModal({isOpen, onClose, onSuccess, product}: EditProductModalProps) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [category, setCategory] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    // Preenche os campos sempre que um produto for selecionado para edição
    useEffect(()=>{
        if (product) {
            setName(product.name || '');
            setPrice(product.price ? product.price.toString() : '');
            setStock(product.stock ? product.stock.toString() : '');
            setCategory(product.category || '');
            setImageFile(null);
        }
    },[product]);

    if (!isOpen || !product) return null;

    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        if (!product?.id) return;
        
        try{
            setLoading(true);
            const formData = new FormData();
            formData.append('name', name);
            formData.append('price', price);
            formData.append('stock', stock);
            if(category) formData.append('category', category);
            if(imageFile) formData.append('image', imageFile);

            await productService.updateProduct(product.id, formData);

            onSuccess();
            
        }catch(err){
            alert('Erro ao atualizar produto');
            console.error(err);
        }finally{
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-zinc-900 w-full max-w-md mx-auto rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
                
                {/* Cabeçalho */}
                <div className="flex justify-between items-center px-6 py-4 bg-zinc-950 border-b border-zinc-800">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
                        <Edit3 size={18} />
                        <span>Editar Produto #{product.id}</span>
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

                    <div className="grid grid-cols-2 gap-3">
                        {/* Preço */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Preço (R$) *
                            </label>
                            <input 
                                type="number"
                                step='0.01'
                                required
                                value={price}
                                onChange={(e) => {setPrice(e.target.value)}}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-medium placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm" 
                                placeholder="0.00"
                            />
                        </div>

                        {/* Estoque Atual */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Estoque Atual *
                            </label>
                            <input 
                                type="number"
                                step='0.01'
                                required
                                value={stock}
                                onChange={(e) => {setStock(e.target.value)}} 
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
                            onChange={(e) => {setCategory(e.target.value)}}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-medium placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm"
                            placeholder="Ex: Bebidas, Limpeza"
                        />
                    </div>

                    {/* Nova Imagem */}
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                            Nova Imagem (Opcional)
                        </label>
                        <div className="relative">
                            <input 
                                type="file" 
                                accept="image/*"
                                id="edit-product-image-file"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]){
                                        setImageFile(e.target.files[0]);
                                    }
                                }}
                                className="hidden"
                            />
                            <label 
                                htmlFor="edit-product-image-file"
                                className="w-full py-3 px-4 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Upload size={16} className="text-cyan-400" />
                                {imageFile ? imageFile.name : 'Selecionar Nova Imagem'}
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
                            {loading ? 'A atualizar...' : 'Salvar Alterações'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}