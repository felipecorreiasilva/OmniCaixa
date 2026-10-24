export interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
  category?: string;
  image_url?: string;
  created_at?: string;
}