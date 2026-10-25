import { Router } from 'express';
import { SalesController } from '../controllers/salesController'; // Ajuste o caminho conforme o teu projeto
import { verifyToken } from '../middlewares/verifyToken'; // Ajuste o caminho do teu middleware

const router = Router();

// A rota de criar venda agora está protegida pelo middleware verifyToken
router.post('/sales', verifyToken, SalesController.createSale);

export default router;