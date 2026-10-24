import { Request, Response } from 'express';
import { ProductModel } from '../models/productModel';

export const ProductController = {
  // Buscar todos os produtos
  async getProducts(req: Request, res: Response) {
    try {
      const products = await ProductModel.findAll();
      return res.json(products);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao buscar produtos: ' + error.message });
    }
  },

  // Criar um novo produto
  async createProduct(req: Request, res: Response) {
    try {
      const { name, price, stock } = req.body;

      if (!name || price === undefined) {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
      }

      const newProduct = await ProductModel.create({
        name,
        price,
        stock: stock || 0
      });

      return res.status(201).json(newProduct);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao criar produto: ' + error.message });
    }
  }
};