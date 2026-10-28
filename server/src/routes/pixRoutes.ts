import { Router } from 'express';
import { gerarQrCodePix } from '../controllers/pixController';

const router = Router();

// Rota que o Next.js vai chamar para criar a cobrança
router.post('/gerar', gerarQrCodePix);

export default router;