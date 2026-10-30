import {api} from "./api"; // A tua instância do axios configurada

export interface SalePayload {
  payment_method: string;
  total_amount: number;
  amount_paid?: number;
  change?: number;
  items: {
    product_id: number;
    quantity: number;
    price: number;
  }[];
}

export const saleService = {
  async createSale(saleData: SalePayload) {
    const response = await api.post("/sales", saleData);
    return response.data;
  },
};