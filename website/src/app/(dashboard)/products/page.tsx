'use client';

import { useState, useEffect } from 'react';
import { productService } from '@/services/productService';
import { Product } from '@/types/product';
import CreateProductModal from '@/components/products/CreateProductModal';
import { SquarePen, Trash, Search, Image as ImageIcon, Package } from 'lucide-react';
import EditProductModal from '@/components/products/EditProductModal';
import DeleteProductModal from '@/components/products/DeleteProductModal';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.2.107:3333";

export default function ProductsPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            setLoading(true);
            const data = await productService.getAllProducts();
            setProducts(data);
        } catch (err) {
            setError('Erro ao carregar a lista de produtos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const filteredProducts = products.filter((product) => {
        const term = searchTerm.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(term);
        const matchesBarcode = product.barcode ? product.barcode.toLowerCase().includes(term) : false;
        const matchesCategory = product.category ? product.category.toLowerCase().includes(term) : false;

        return matchesName || matchesBarcode || matchesCategory;
    });

    return (
        <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    
                    {/* Cabeçalho e Botão de Novo Produto */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                                <Package className="text-cyan-400" size={26} />
                                Gestão de Produtos e Estoque
                            </h1>
                            <p className="text-sm text-zinc-400 mt-1">Cadastre e gerencie os itens disponíveis no PDV.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition shadow-sm cursor-pointer"
                        >
                            + Novo Produto
                        </button>
                    </div>

                    {/* Barra de Pesquisa */}
                    <div className="relative w-full sm:w-96">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Pesquisar por nome, código ou categoria..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm transition"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 text-red-400 text-xs p-3.5 rounded-2xl border border-red-500/20">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12 text-zinc-500 text-sm">A carregar produtos...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500 bg-zinc-900 rounded-3xl border border-zinc-800">
                            Nenhum produto encontrado para "{searchTerm}".
                        </div>
                    ) : (
                        <>
                            {/* 1. VISÃO EM TABELA (Desktop) */}
                            <div className="hidden md:block bg-zinc-900 shadow-xl rounded-3xl overflow-hidden border border-zinc-800">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-950 text-zinc-400 uppercase text-[11px] tracking-wider border-b border-zinc-800">
                                            <th className="p-4">Foto</th>
                                            <th className="p-4">ID</th>
                                            <th className="p-4">Cód. de Barras</th>
                                            <th className="p-4">Nome do Produto</th>
                                            <th className="p-4">Categoria</th>
                                            <th className="p-4">Preço (R$)</th>
                                            <th className="p-4">Estoque Atual</th>
                                            <th className="p-4 text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800 text-sm text-zinc-300">
                                        {filteredProducts.map((product) => {
                                            const nameLower = product.name.toLowerCase();
                                            const isKg = nameLower.includes("(kg)") || nameLower.includes("kg");
                                            
                                            const formattedStock = isKg 
                                                ? Number(product.stock).toFixed(3) 
                                                : Math.round(Number(product.stock));

                                            return (
                                                <tr key={product.id} className="hover:bg-zinc-800/50 transition">
                                                    <td className="p-4">
                                                        <div className="w-10 h-10 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center p-0.5">
                                                            {product.image_url ? (
                                                                <img 
                                                                    src={`${API_URL}${product.image_url}`} 
                                                                    alt={product.name} 
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            ) : (
                                                                <ImageIcon size={16} className="text-zinc-600" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-mono text-zinc-500">#{product.id}</td>
                                                    <td className="p-4 font-mono text-xs text-zinc-400">
                                                        {product.barcode || <span className="text-zinc-600 italic">Sem código</span>}
                                                    </td>
                                                    <td className="p-4 font-semibold text-white">{product.name}</td>
                                                    <td className="p-4 text-zinc-400">{product.category || 'Geral'}</td>
                                                    <td className="p-4 text-cyan-400 font-bold">R$ {Number(product.price).toFixed(2)}</td>
                                                    <td className="p-4 font-semibold text-zinc-200">
                                                        {formattedStock} {isKg ? 'kg' : 'un.'}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button 
                                                                type="button"
                                                                onClick={() => setEditingProduct(product)}
                                                                className="cursor-pointer bg-zinc-950 text-cyan-400 hover:text-cyan-300 p-2 rounded-xl border border-zinc-800 transition"
                                                                title="Editar"
                                                            >
                                                                <SquarePen size={16} />
                                                            </button>

                                                            {user?.role === 'admin' && (
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => setDeletingProduct(product)}
                                                                    className="cursor-pointer bg-zinc-950 text-red-400 hover:text-red-300 p-2 rounded-xl border border-zinc-800 transition"
                                                                    title="Excluir"
                                                                >
                                                                    <Trash size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* 2. VISÃO EM CARDS (Mobile) */}
                            <div className="grid grid-cols-1 gap-3 md:hidden">
                                {filteredProducts.map((product) => {
                                    const nameLower = product.name.toLowerCase();
                                    const isKg = nameLower.includes("(kg)") || nameLower.includes("kg");
                                    const formattedStock = isKg 
                                        ? Number(product.stock).toFixed(3) 
                                        : Math.round(Number(product.stock));

                                    return (
                                        <div 
                                            key={product.id} 
                                            className="bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-800 flex flex-col justify-between gap-3"
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="w-14 h-14 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shrink-0 flex items-center justify-center p-1">
                                                    {product.image_url ? (
                                                        <img 
                                                            src={`${API_URL}${product.image_url}`} 
                                                            alt={product.name} 
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <ImageIcon size={20} className="text-zinc-600" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[10px] font-mono text-zinc-500">#{product.id}</span>
                                                    <h3 className="font-bold text-white text-sm truncate">{product.name}</h3>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <span className="inline-block bg-zinc-950 text-zinc-400 border border-zinc-800 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                                            {product.category || 'Geral'}
                                                        </span>
                                                        <span className="text-[11px] font-mono text-zinc-500">
                                                            {product.barcode || 'Sem código'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-sm font-bold text-cyan-400">
                                                        R$ {Number(product.price).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-2.5 border-t border-zinc-800 text-xs">
                                                <span className="text-zinc-400">
                                                    Estoque: <strong className="text-white">{formattedStock} {isKg ? 'kg' : 'un.'}</strong>
                                                </span>
                                                
                                                <div className="flex items-center gap-1.5">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setEditingProduct(product)}
                                                        className="cursor-pointer p-2 bg-zinc-950 text-cyan-400 hover:text-cyan-300 rounded-xl transition border border-zinc-800"
                                                        title="Editar"
                                                    >
                                                        <SquarePen size={14} />
                                                    </button>

                                                    {user?.role === 'admin' && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => setDeletingProduct(product)}
                                                            className="cursor-pointer p-2 bg-zinc-950 text-red-400 hover:text-red-300 rounded-xl transition border border-zinc-800"
                                                            title="Excluir"
                                                        >
                                                            <Trash size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Modais */}
                    <CreateProductModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSuccess={() => {
                            setIsModalOpen(false);
                            loadProducts();
                        }}
                    />

                    <EditProductModal 
                        isOpen={!!editingProduct}
                        product={editingProduct}
                        onClose={() => setEditingProduct(null)}
                        onSuccess={() => {
                            setEditingProduct(null);
                            loadProducts();
                        }}
                    />

                    <DeleteProductModal
                        isOpen={!!deletingProduct}
                        product={deletingProduct}
                        onClose={() => setDeletingProduct(null)}
                        onSuccess={() => {
                            setDeletingProduct(null);
                            loadProducts();
                        }}
                    />

                </div>
            </div>
        </ProtectedRoute>
    );
}