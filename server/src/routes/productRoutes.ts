import { Router } from 'express';
import { ProductController } from '../controllers/productController';

const router = Router();

// Rota para listar produtos (GET /products)
router.get('/products', ProductController.getProducts);

// Rota para cadastrar um produto (POST /products)
router.post('/products', ProductController.createProduct);

export default router;