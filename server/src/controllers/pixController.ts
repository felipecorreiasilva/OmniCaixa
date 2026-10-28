import { Request, Response } from 'express';
import efipay from '../config/efi'; // Importa a instância que configuraste

// 1. Gera a cobrança Pix imediata e o QR Code em Base64
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
      chave: process.env.EFI_PIX_CHAVE || '',
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

// 2. Consulta o status de uma cobrança Pix pelo txid
export async function consultarCobrancaPix(req: Request, res: Response) {
  try {
    // Garante que o txid é tratado estritamente como string
    const txid = String(req.params.txid || '');

    if (!txid) {
      return res.status(400).json({ error: 'TXID não fornecido.' });
    }

    const response = await efipay.pixDetailCharge({ txid });

    return res.json({
      success: true,
      status: response.status, // Ex: "CONCLUIDA", "ATIVA", etc.
      valor: response.valor?.original,
    });
  } catch (error: any) {
    console.error('Erro ao consultar Pix na Efí:', error?.data || error);
    return res.status(500).json({ error: 'Erro ao consultar status do Pix.' });
  }
}

// 3. Webhook para receber a notificação automática da Efí quando o cliente pagar
export async function webhookPix(req: Request, res: Response) {
  try {
    const eventos = req.body.pix;

    if (eventos && eventos.length > 0) {
      for (const evento of eventos) {
        const txid = evento.txid;
        const valorPago = evento.valor;
        const horario = evento.horario;

        console.log(`[WEBHOOK] Pix pago recebido! TXID: ${txid} | Valor: R$ ${valorPago} | Horário: ${horario}`);

        // TODO: Atualizar o status da venda na base de dados para paga/concluída
      }
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Erro no processamento do Webhook Pix:', error);
    return res.status(500).json({ error: 'Erro ao processar webhook' });
  }
}