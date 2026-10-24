import db from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
}

export const ProductModel = {
  async findAll(): Promise<Product[]> {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM products');
    return rows as Product[];
  },

  async create(product: Product): Promise<Product> {
    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO products (name, price, stock) VALUES (?, ?, ?)',
      [product.name, product.price, product.stock]
    );
    return { id: result.insertId, ...product };
  }
};