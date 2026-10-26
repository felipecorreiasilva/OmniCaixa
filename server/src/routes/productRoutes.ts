import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import multer from 'multer';
import uploadProductsConfig from '../config/uploadProducts';
import { verifyToken } from '../middlewares/verifyToken';
import { verifyAdmin } from '../middlewares/verifyAdmin';
import { verifyAdminOrManager } from '../middlewares/verifyAdminOrManager';

const router = Router();
const uploadProduct = multer(uploadProductsConfig);

// Rota para listar produtos (GET /products)
router.get('/products', verifyToken, ProductController.getProducts);

// Rota para buscar um produto por ID (GET /products/:id)
router.get('/products/:id', verifyToken, ProductController.getProductById);

// Rota para cadastrar um produto (POST /products)
router.post('/products', verifyToken, verifyAdminOrManager, uploadProduct.single('image'), ProductController.createProduct);

// Rota para atualizar um produto (PUT /products/:id)
router.put('/products/:id', verifyToken, verifyAdminOrManager, ProductController.updateProduct);

// Rota para deletar um produto (DELETE /products/:id)
router.delete('/products/:id', verifyToken, verifyAdmin, ProductController.deleteProduct);

export default router;