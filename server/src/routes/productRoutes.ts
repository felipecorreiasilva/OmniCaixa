import { Router } from 'express';
import { ProductController } from '../controllers/productController';

const router = Router();

// Rota para listar produtos (GET /products)
router.get('/products', ProductController.getProducts);

// Rota para buscar um produto por ID (GET /products/:id)
router.get('/products/:id', ProductController.getProductById);

// Rota para cadastrar um produto (POST /products)
router.post('/products', ProductController.createProduct);

// Rota para atualizar um produto (PUT /products/:id)
router.put('/products/:id', ProductController.updateProduct);

// Rota para deletar um produto (DELETE /products/:id)
router.delete('/products/:id', ProductController.deleteProduct);

export default router;