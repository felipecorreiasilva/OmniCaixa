import { Request, Response } from 'express';
import { ProductModel } from '../models/productModel';
import fs from 'fs';
import path from 'path';

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
        image_url = `${baseUrl}/uploads/products/${req.file.filename}`;
      }
      const newProduct = await ProductModel.create({ name, price, stock, category, image_url });
      return res.status(201).json(newProduct);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao criar produto: ' + error.message });
    }
  },

  // Atualizar um produto existente com suporte a troca de imagem e remoção da antiga
  async updateProduct(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { name, price, stock, category } = req.body;
        const imageFile = req.file;

        if (!name || price === undefined) {
            // Se houver erro de validação mas um ficheiro foi enviado, apaga-o para não ficar órfão
            if (imageFile) {
                fs.unlink(imageFile.path, () => {});
            }
            return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
        }

        // 1. Buscar o produto atual na base de dados para obter o caminho da imagem antiga
        const existingProduct = await ProductModel.findById(Number(id));
        if (!existingProduct) {
            if (imageFile) {
                fs.unlink(imageFile.path, () => {});
            }
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        // Objeto base para a atualização
        const updateData: any = {
            name,
            price: Number(price),
            stock: stock !== undefined ? Number(stock) : undefined,
            category
        };

        // 2. Se um novo ficheiro foi enviado, constrói a nova URL pública
        if (imageFile) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            updateData.image_url = `${baseUrl}/uploads/products/${imageFile.filename}`;
        }

        // 3. Atualizar na base de dados
        const updatedProduct = await ProductModel.update(Number(id), updateData);
        
        if (!updatedProduct) {
            if (imageFile) {
                fs.unlink(imageFile.path, () => {});
            }
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        // 4. Se o produto foi atualizado E o utilizador enviou uma NOVA imagem, apaga a imagem antiga do disco
        if (imageFile && existingProduct.image_url) {
            try {
                let relativePath = existingProduct.image_url;
                
                if (existingProduct.image_url.startsWith('http')) {
                    const parsedUrl = new URL(existingProduct.image_url);
                    relativePath = parsedUrl.pathname; // Fica com "/uploads/products/foto-antiga.jpg"
                }

                // Sobe duas pastas a partir de 'controllers' para chegar à raiz e encontrar a pasta 'uploads'
                const oldFilePath = path.join(__dirname, '..', '..', relativePath);

                if (fs.existsSync(oldFilePath)) {
                    fs.unlink(oldFilePath, (err) => {
                        if (err) console.error('Erro ao apagar a imagem antiga do disco:', err);
                        else console.log('Imagem antiga apagada com sucesso:', oldFilePath);
                    });
                }
            } catch (unlinkError) {
                console.error('Erro ao processar o caminho da imagem antiga para exclusão:', unlinkError);
            }
        }
        
        return res.json({
            message: 'Produto atualizado com sucesso!',
            product: updatedProduct
        });

    } catch (error: any) {
        // Se ocorrer qualquer exceção inesperada e houver um ficheiro novo carregado, limpa-o
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
        return res.status(500).json({ error: 'Erro ao atualizar produto: ' + error.message });
    }
  },

    // Deletar um produto
    async deleteProduct(req: Request, res: Response) {
      try {
          const { id } = req.params;

          // 1. Opcional: Buscar o produto primeiro para obter o caminho da imagem antiga
          const product = await ProductModel.findById(Number(id));
          
          if (!product) {
              return res.status(404).json({ error: 'Produto não encontrado.' });
          }

          // 2. Apagar o registo da base de dados
          await ProductModel.delete(Number(id));

          // 3. Apagar o ficheiro físico da pasta uploads (se ele existir)
          if (product.image_url) {
            try {
                // Se a image_url for uma URL completa (ex: http://localhost:3333/uploads/products/foto.jpg)
                // extraímos apenas o pathname (/uploads/products/foto.jpg)
                let relativePath = product.image_url;
                
                if (product.image_url.startsWith('http')) {
                    const parsedUrl = new URL(product.image_url);
                    relativePath = parsedUrl.pathname; // Fica apenas com "/uploads/products/foto.jpg"
                }

                // Agora combinamos com o diretório atual do projeto para chegar ao ficheiro físico
                // Subimos duas pastas a partir de 'controllers' (ajusta se necessário) para chegar à raiz do backend
                const filePath = path.join(__dirname, '..', '..', relativePath);

                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error('Erro ao apagar o ficheiro do disco:', err);
                        else console.log('Imagem física apagada com sucesso:', filePath);
                    });
                }
            } catch (error) {
                console.error('Erro ao processar o caminho da imagem para exclusão:', error);
            }
        }

        return res.json({ message: 'Produto e imagem excluídos com sucesso!' });

      } catch (error: any) {
          return res.status(500).json({ error: 'Erro ao excluir produto: ' + error.message });
      }
    }
};