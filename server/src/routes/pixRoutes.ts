import { Router } from 'express';
import { 
  gerarQrCodePix, 
  consultarCobrancaPix, 
  webhookPix 
} from '../controllers/pixController';

const router = Router();

// Rota que o Next.js chama para criar a cobrança imediata e o QR Code
router.post('/gerar', gerarQrCodePix);

// Rota para consultar o status da cobrança manualmente ou via polling
router.get('/consultar/:txid', consultarCobrancaPix);

// Rota que a Efí Bank vai chamar automaticamente (Webhook) quando o Pix for pago
router.post('/webhook', webhookPix);

// Algumas versões da API da Efí fazem uma requisição HEAD para validar o endpoint
router.head('/webhook', (req, res) => {
  res.status(200).send();
});

export default router;