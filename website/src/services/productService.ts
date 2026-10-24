import {api} from './api'
import {Product} from '../types/product'

export const productService = {
    // Recebe listagem de produtos do backend
    async getAllProducts(): Promise<Product[]> {
        const response = await api.get<Product[]>('/products')
        return response.data;
    },

    // Recebe produto por id do backend
    async getProductByid(id: number): Promise<Product> {
        const response = await api.get<Product>(`products/${id}`)
        return response.data;
    },

    // Alterado para aceitar FormData (necessário para o upload de imagem via multer)
    async createProduct(productData: FormData): Promise<Product> {
        const response = await api.post<Product>('/products', productData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data;
    },

    // Alterado para aceitar FormData (necessário para o upload de imagem via multer)
    async updateProduct(id: number, productData: FormData | Product): Promise<Product> {
        const response = await api.put<Product>(`/products/${id}`, productData)
        return response.data;
    },

    async deleteProduct(id: number): Promise<void> {
        await api.delete(`products/${id}`)
    }
}