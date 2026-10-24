export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category?: string;
  created_at?: string;
}