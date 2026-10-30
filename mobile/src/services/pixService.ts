import { api } from './api';

export const pixService = {
  // Gera a cobrança imediata e retorna o QR Code em Base64 e o Pix Copia e Cola
  async gerarCobrancaPix(totalAmount: number) {
    const response = await api.post('/api/pix/gerar', {
      total_amount: totalAmount,
    });
    return response.data;
  },

  // Consulta o status atual da cobrança na Efí usando o TXID (ex: "CONCLUIDA", "ATIVA")
  async consultarStatusPix(txid: string) {
    const response = await api.get(`/api/pix/consultar/${txid}`);
    return response.data;
  },
};