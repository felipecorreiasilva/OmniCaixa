import db from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
  category?: string;
  created_at?: string;
}

export const ProductModel = {
  async findAll(): Promise<Product[]> {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM products');
    return rows as Product[];
  },

  async findById(id: number): Promise<Product | null> {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) {
      return null;
    }
    return rows[0] as Product;
  },

  async create(product: Product): Promise<Product> {
    const [result] = await db.execute<ResultSetHeader>(
    'INSERT INTO products (name, price, stock, category) VALUES (?, ?, ?, ?)',
    [product.name, product.price, product.stock, product.category || 'Geral']
  );
    return { id: result.insertId, ...product };
  },

  async update(id: number, product: Product): Promise<Product | null> {
    const [result] = await db.execute<ResultSetHeader>(
        'UPDATE products SET name = ?, price = ?, stock = ?, category = ? WHERE id = ?',
        [product.name, product.price, product.stock, product.category || 'Geral', id]);
        if (result) {
            return { id, ...product };
        }
    return null;
  },

  async delete(id: number): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};