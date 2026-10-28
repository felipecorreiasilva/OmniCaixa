import { Request, Response } from 'express';
import efipay from '../config/efi'; // Importa a instância que configuraste

export async function gerarQrCodePix(req: Request, res: Response) {
  try {
    const { total_amount } = req.body;

    if (!total_amount || total_amount <= 0) {
      return res.status(400).json({ error: 'Valor inválido para o pagamento Pix.' });
    }

    // Corpo da requisição para a Efí (SEM O CAMPO DEVEDOR, pois é venda balcão anônima)
    const body = {
      calendario: {
        expiracao: 600 // Expira em 10 minutos (600 segundos)
      },
      valor: {
        original: Number(total_amount).toFixed(2) // Ex: "45.00"
      },
      chave: process.env.EFI_PIX_CHAVE || 'a-tua-chave-pix-aqui', 
      solicitacaoPagador: 'Pagamento OmniCaixa PDV'
    };

    // 1. Cria a cobrança imediata na Efí
    const cobResponse = await efipay.pixCreateImmediateCharge({}, body);
    const txid = cobResponse.txid;
    const locId = cobResponse.loc.id;

    // 2. Gera o QR Code visual e o Pix Copia e Cola usando o loc.id
    const qrCodeResponse = await efipay.pixGenerateQRCode({ id: locId });

    return res.json({
      success: true,
      txid,
      pixCopiaECola: qrCodeResponse.copiaECola,
      qrCodeImage: qrCodeResponse.imagemQrcode // Imagem em Base64 para exibir na tag <img>
    });

  } catch (error: any) {
    console.error('Erro ao gerar Pix na Efí:', error?.data || error);
    return res.status(500).json({ error: 'Erro interno ao gerar cobrança Pix.' });
  }
}