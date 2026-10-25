import db from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface SaleItemInput {
    product_id: number;
    quantity: number;
    unit_price: number;
}

export interface CreateSaleInput {
    payment_method: string;
    total_amount: number;
    amount_paid: number;
    change: number;
    items: SaleItemInput[];
}

export const SaleModel = {
    async createSale(data: CreateSaleInput): Promise<{ success: boolean; saleId: number }> {
        // 1. Obtém uma conexão dedicada do pool para gerir a transação atômica
        const connection = await db.getConnection();

        try {
            // Inicia a transação
            await connection.beginTransaction();

            // 2. Insere o cabeçalho da venda na tabela 'sales'
            const [saleResult] = await connection.execute<ResultSetHeader>(
                `INSERT INTO sales (total_amount, payment_method, amount_paid, change) VALUES (?, ?, ?, ?)`,
                [
                    data.total_amount,
                    data.payment_method,
                    data.amount_paid,
                    data.change
                ]
            );

            const saleId = saleResult.insertId;

            // 3. Insere os itens na tabela 'sale_items' e dá baixa no estoque de cada produto
            for (const item of data.items) {
                // Insere o item da venda
                await connection.execute<ResultSetHeader>(
                    `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`,
                    [saleId, item.product_id, item.quantity, item.unit_price]
                );

                // Atualiza o estoque do produto (suporta unidades inteiras e gramas/quilos)
                await connection.execute<ResultSetHeader>(
                    `UPDATE products SET stock = stock - ? WHERE id = ?`,
                    [item.quantity, item.product_id]
                );
            }

            // Se tudo correu bem, confirma a transação no banco de dados
            await connection.commit();
            return { success: true, saleId };

        } catch (error) {
            // Se houver qualquer falha, desfaz todas as alterações (rollback) para proteger o estoque
            await connection.rollback();
            console.error("Erro na transação da venda (rollback executado):", error);
            throw error;

        } finally {
            // Libera a conexão de volta para o pool do banco
            connection.release();
        }
    }
};