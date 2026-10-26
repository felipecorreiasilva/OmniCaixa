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
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
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

    async function handleDelete(id?: number) {
        if (!id) return;
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            try {
                await productService.deleteProduct(id);
                loadProducts(); // Recarrega a lista após excluir
            } catch (err) {
                alert('Erro ao excluir o produto.');
                console.error(err);
            }
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                    >
                        + Novo Produto
                    </button>
                </div>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                {/* Tabela de Produtos */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
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
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-6 text-gray-500">A carregar produtos...</td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-6 text-gray-500">Nenhum produto cadastrado.</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-mono text-gray-500">#{product.id}</td>
                                        <td className="p-4 font-medium text-gray-900">{product.name}</td>
                                        <td className="p-4 text-gray-600">{product.category || 'Geral'}</td>
                                        <td className="p-4">R$ {Number(product.price).toFixed(2)}</td>
                                        <td className="p-4 font-semibold">{product.stock}</td>
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

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
                        setEditingProduct(null)
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