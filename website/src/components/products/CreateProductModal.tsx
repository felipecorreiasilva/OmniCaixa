'use client';

import { useState } from 'react';

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
            
            // Adiciona o código de barras se o operador tiver preenchido ou bipedado
            if (barcode) formData.append('barcode', barcode);
            
            formData.append('name', name);
            formData.append('price', price);
            formData.append('stock', stock);
            if (category) formData.append('category', category);
            if (imageFile) formData.append('image', imageFile);

            // Importação dinâmica do productService
            const { productService } = await import('@/services/productService');
            await productService.createProduct(formData);

            // Limpa o formulário após o sucesso
            setBarcode('');
            setName('');
            setPrice('');
            setStock('');
            setCategory('');
            setImageFile(null);

            onSuccess(); // Fecha o modal e recarrega a lista na página pai
        } catch (err) {
            alert('Erro ao cadastrar produto. Verifique as permissões (RBAC).');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-md px-4">
            <div className="bg-white rounded-xl p-6 w-full mx-auto max-w-md shadow-2xl">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Cadastrar Novo Produto</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Campo de Código de Barras */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código de Barras (EAN-13 / Opcional)
                        </label>
                        <input
                            type="text"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            maxLength={13}
                            className="text-black w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Passe o leitor ou digite o código..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-black w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ex: Coca-Cola 2L"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="text-black w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Inicial</label>
                            <input
                                type="number"
                                step="0.001"
                                required
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="text-black w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="10"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria (Opcional)</label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="text-black w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ex: Bebidas, Limpeza"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do Produto (Opcional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setImageFile(e.target.files[0]);
                                }
                            }}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? 'A salvar...' : 'Salvar Produto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}