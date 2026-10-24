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

  // Buscar um produto por ID
  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductModel.findById(Number(id));
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }
      return res.json(product);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao buscar produto: ' + error.message });
    }
  },

  // Criar um novo produto
  async createProduct(req: Request, res: Response) {
    try {
      const { name, price, stock, category } = req.body;

      if (!name || price === undefined) {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
      }
      const newProduct = await ProductModel.create({ name, price, stock, category });
      return res.status(201).json(newProduct);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao criar produto: ' + error.message });
    }
  },

  // Atualizar um produto existente
  async updateProduct(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { name, price, stock, category} = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
        }
        const updateProduct = await ProductModel.update(Number(id), { name, price, stock, category });
        if (!updateProduct) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }
        return res.json(updateProduct);

    }catch (error: any) {
      return res.status(500).json({ error: 'Erro ao atualizar produto: ' + error.message });
    }
    },

    // Deletar um produto
    async deleteProduct(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const deleted = await ProductModel.delete(Number(id));
            if (!deleted) {
                return res.status(404).json({ error: 'Produto não encontrado.' });
            }
            return res.json({ message: 'Produto deletado com sucesso.' });
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao deletar produto: ' + error.message });
        }
    }
};