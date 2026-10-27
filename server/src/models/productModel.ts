import db from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Product {
  id: number;
  barcode?: string | null;
  name: string;
  price: number;
  stock: number;
  category?: string;
  image_url?: string | null;
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

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO products (barcode, name, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [
        product.barcode ?? null, 
        product.name, 
        product.price, 
        product.stock, 
        product.category || 'Geral', 
        product.image_url || null
      ]
    );
    return { ...product, id: result.insertId };
  },

  async update(id: number, product: Partial<Product>): Promise<Product | null> {
    const [result] = await db.execute<ResultSetHeader>(
      'UPDATE products SET barcode = ?, name = ?, price = ?, stock = ?, category = ?, image_url = ? WHERE id = ?',
      [
        product.barcode ?? null, 
        product.name ?? '', 
        product.price ?? 0, 
        product.stock ?? 0, 
        product.category || 'Geral', 
        product.image_url ?? null, 
        id
      ]
    );
    if (result.affectedRows === 0) {
      return null;
    } 
    return await this.findById(id);
  },

  async delete(id: number): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};