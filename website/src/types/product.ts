export interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
  category?: string;
  image_url?: string;
  created_at?: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  image_url?: string;
  quantity: number;
  quantityStr?: string; // Para controlar a digitação livre no input
}