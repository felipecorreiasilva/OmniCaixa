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

  // Criar um novo produto com suporte a upload de imagem
  async createProduct(req: Request, res: Response) {
    try {
      const { name, price, stock, category } = req.body;

      if (!name || price === undefined) {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
      }
      // 1. Verifica se um ficheiro de imagem foi enviado pelo Multer
      let image_url = req.body.image_url || ''; // Mantém caso venha por URL direta
      if (req.file) {
        // 2. Constrói a URL pública base do servidor dinamicamente
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        image_url = `${baseUrl}/uploads/${req.file.filename}`;
      }
      const newProduct = await ProductModel.create({ name, price, stock, category, image_url });
      return res.status(201).json(newProduct);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao criar produto: ' + error.message });
    }
  },

  // Atualizar um produto existente
  async updateProduct(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { name, price, stock, category, image_url } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
        }
        const updateProduct = await ProductModel.update(Number(id), { name, price, stock, category, image_url });
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