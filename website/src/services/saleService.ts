import { api } from "./api"; // A tua instância do axios configurada

export interface SaleItemPayload {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface SalePayload {
  id?: number;
  payment_method: string;
  total_amount: number;
  amount_paid?: number | null;
  change?: number;
  status?: string;
  txid?: string | null;
  items: SaleItemPayload[];
  created_at?: string;
}

export const saleService = {
  // Obter todas as vendas
  async getAllSales(): Promise<SalePayload[]> {
    const response = await api.get("/sales");
    return response.data;
  },

  // Obter uma venda específica por ID (incluindo os itens)
  async getSaleById(id: number): Promise<SalePayload> {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  // Criar nova venda (PDV)
  async createSale(saleData: SalePayload) {
    const response = await api.post("/sales", saleData);
    return response.data;
  },

  // Cancelar uma venda (reverte o stock e altera o status para CANCELADA)
  async cancelSale(id: number) {
    const response = await api.patch(`/sales/${id}/cancel`); // Ajusta a rota conforme o teu controller no backend (ex: patch ou delete)
    return response.data;
  },
};