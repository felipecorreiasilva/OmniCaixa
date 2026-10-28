import { api } from './api';

export const pixService = {
  async gerarCobrancaPix(totalAmount: number) {
    // Como a 'api' já tem o baseURL configurado e injeta o token JWT automaticamente,
    // basta fazermos o post relativo à rota do backend.
    const response = await api.post('/api/pix/gerar', {
      total_amount: totalAmount,
    });
    return response.data;
  },
};