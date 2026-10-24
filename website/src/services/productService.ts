import {api} from './api'
import {Product} from '../types/product'

export const productService = {
    async getAllProducts(): Promise<Product[]> {
        const response = await api.get<Product[]>('/products')
        return response.data;
    },

    async getProductByid(id: number): Promise<Product> {
        const response = await api.get<Product>(`products/${id}`)
        return response.data;
    },

    async createProduct(product: Product): Promise<Product> {
        const response = await api.post<Product>('/products', product)
        return response.data;
    },

    async updateProduct(id: number, product: Product): Promise<Product> {
        const response = await api.put<Product>(`products/${id}`, product)
        return response.data;
    },

    async deleteProduct(id: number): Promise<void> {
        await api.delete(`products/${id}`)
    }
}