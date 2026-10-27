'use client';

import { useState, useEffect } from 'react';
import { productService } from '@/services/productService';
import { Product } from '@/types/product';
import CreateProductModal from '@/components/products/CreateProductModal';
import { SquarePen, Trash } from 'lucide-react';
import EditProductModal from '@/components/products/EditProductModal';
import DeleteProductModal from '@/components/products/DeleteProductModal';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

    // Carregar produtos ao abrir a página
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

    return (
        <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Gestão de Produtos e Estoque</h1>
                        <p className="text-sm text-gray-500">Cadastre e gerencie os itens disponíveis no PDV.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition cursor-pointer"
                    >
                        + Novo Produto
                    </button>
                </div>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                {loading ? (
                    <div className="text-center py-6 text-gray-500">A carregar produtos...</div>
                ) : products.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">Nenhum produto cadastrado.</div>
                ) : (
                    <>
                        {/* 1. VISÃO EM TABELA (Apenas para telas médias e grandes - Desktop) */}
                        <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider border-b">
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Nome do Produto</th>
                                        <th className="p-4">Categoria</th>
                                        <th className="p-4">Preço (R$)</th>
                                        <th className="p-4">Estoque Atual</th>
                                        <th className="p-4 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                                    {products.map((product) => {
                                        const nameLower = product.name.toLowerCase();
                                        const isKg = nameLower.includes("(kg)") || nameLower.includes("kg");
                                        
                                        // Formatação do estoque: inteiros limpos para unidades, 3 casas decimais para kg
                                        const formattedStock = isKg 
                                            ? Number(product.stock).toFixed(3) 
                                            : Math.round(Number(product.stock));

                                        return (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="p-4 font-mono text-gray-500">#{product.id}</td>
                                                <td className="p-4 font-medium text-gray-900">{product.name}</td>
                                                <td className="p-4 text-gray-600">{product.category || 'Geral'}</td>
                                                <td className="p-4">R$ {Number(product.price).toFixed(2)}</td>
                                                <td className="p-4 font-semibold">
                                                    {formattedStock} {isKg ? 'kg' : 'un.'}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button 
                                                            onClick={() => setEditingProduct(product)}
                                                            className="cursor-pointer text-blue-600 hover:text-blue-800 transition p-1"
                                                            title="Editar"
                                                        >
                                                            <SquarePen size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => setDeletingProduct(product)}
                                                            className="cursor-pointer text-red-600 hover:text-red-800 transition p-1"
                                                            title="Excluir"
                                                        >
                                                            <Trash size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* 2. VISÃO EM CARDS (Apenas para telas pequenas - Telemóveis) */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {products.map((product) => {
                                const nameLower = product.name.toLowerCase();
                                const isKg = nameLower.includes("(kg)") || nameLower.includes("kg");
                                const formattedStock = isKg 
                                    ? Number(product.stock).toFixed(3) 
                                    : Math.round(Number(product.stock));

                                return (
                                    <div 
                                        key={product.id} 
                                        className="bg-white p-4 rounded-2xl shadow-md border-2 border-slate-300 flex flex-col justify-between gap-3"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-xs font-mono text-slate-400">#{product.id}</span>
                                                <h3 className="font-bold text-slate-900 text-base">{product.name}</h3>
                                                <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full mt-1">
                                                    {product.category || 'Geral'}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-blue-600">
                                                    R$ {Number(product.price).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-sm">
                                            <span className="text-slate-500">
                                                Estoque: <strong className="text-slate-900">{formattedStock} {isKg ? 'kg' : 'un.'}</strong>
                                            </span>
                                            
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => setEditingProduct(product)}
                                                    className="cursor-pointer p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition border border-blue-200"
                                                    title="Editar"
                                                >
                                                    <SquarePen size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => setDeletingProduct(product)}
                                                    className="cursor-pointer p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition border border-red-200"
                                                    title="Excluir"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Componente Modal Isolado */}
                <CreateProductModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        loadProducts();
                    }}
                />

                {/* Componente Modal de Edição */}
                <EditProductModal 
                    isOpen={!!editingProduct}
                    product={editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onSuccess={() => {
                        setEditingProduct(null);
                        loadProducts();
                    }}
                />

                {/* Componente Modal para Deletar */}
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
        </ProtectedRoute>
    );
}