import { productService } from "@/services/productService";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";

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
        /* Adicionado px-4 para garantir respiro nas laterais da tela em mobile */
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 backdrop-blur-md">
            {/* Adicionado w-full e mx-auto para respeitar a largura máxima com margens automáticas */}
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-auto shadow-2xl">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Editar Produto #{product.id}</h2>
                
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-700 mb-1">Nome do Produto</label>
                        <input 
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded-lg p-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                            <input 
                                type="number"
                                step='0.01'
                                required
                                value={price}
                                onChange={(e) => {setPrice(e.target.value)}}
                                className="w-full border rounded-lg p-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Atual</label>
                            <input 
                                type="number"
                                step='0.01'
                                required
                                value={stock}
                                onChange={(e) => {setStock(e.target.value)}} 
                                className="w-full border rounded-lg p-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria (Opcional)</label>
                            <input 
                                type="text"
                                value={category}
                                onChange={(e) => {setCategory(e.target.value)}}
                                className="w-full border rounded-lg p-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Imagem (Opcional)</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]){
                                        setImageFile(e.target.files[0]);
                                    }
                                }}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium cursor-pointer"
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? 'A atualizar...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}