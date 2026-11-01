import { Router } from 'express';
import { SalesController } from '../controllers/salesController';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

// ==========================================
// GET - Obter todas as vendas registadas
// ==========================================
router.get('/sales', verifyToken, SalesController.getAllSales);

// ==========================================
// GET - Obter uma venda específica pelo ID (com os itens)
// ==========================================
router.get('/sales/:id', verifyToken, SalesController.getSaleById);

// ==========================================
// POST - Criar uma nova venda no PDV (com baixa de estoque)
// ==========================================
router.post('/sales', verifyToken, SalesController.createSale);

// ==========================================
// PATCH - Cancelar uma venda específica (reverte o stock e altera o status)
// ==========================================
router.patch('/sales/:id/cancel', verifyToken, SalesController.cancelSale);

export default router;