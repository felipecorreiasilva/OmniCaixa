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
    amount_paid: number | null;
    change: number;
    items: SaleItemInput[];
    txid?: string | null;     
    status?: string;          
}

export const SaleModel = {
    async create(data: CreateSaleInput): Promise<{ success: boolean; saleId: number }> {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Validação estrita (Blindagem contra dados nulos ou maliciosos)
            if (!data.payment_method || typeof data.payment_method !== 'string') {
                throw new Error("O método de pagamento é obrigatório e deve ser válido.");
            }

            const totalAmount = Number(data.total_amount);
            if (isNaN(totalAmount) || totalAmount <= 0) {
                throw new Error("O valor total da venda é inválido.");
            }

            const paymentMethod = data.payment_method;
            const amountPaid = data.amount_paid !== undefined && data.amount_paid !== null ? Number(data.amount_paid) : null;
            const saleChange = data.change !== undefined && data.change !== null ? Number(data.change) : 0;
            const txid = data.txid !== undefined ? data.txid : null;
            
            // O status é obrigatório ou segue a regra explícita enviada pelo Controller
            const status = data.status;
            if (!status || !['PENDENTE', 'CONCLUIDA', 'CANCELADA'].includes(status)) {
                throw new Error("Status da venda inválido ou não informado.");
            }

            const items = Array.isArray(data.items) ? data.items : [];
            if (items.length === 0) {
                throw new Error("A venda não pode ser finalizada sem itens.");
            }

            // 2. Insere o cabeçalho da venda na tabela 'sales' com os dados validados
            const [saleResult] = await connection.execute<ResultSetHeader>(
                `INSERT INTO sales (total_amount, payment_method, amount_paid, \`change\`, txid, status) VALUES (?, ?, ?, ?, ?, ?)`,
                [totalAmount, paymentMethod, amountPaid, saleChange, txid, status]
            );

            const saleId = saleResult.insertId;

            // 3. Insere os itens na tabela 'sale_items' e dá baixa no estoque
            for (const item of items) {
                const productId = Number(item.product_id);
                const quantity = Number(item.quantity) || 0;
                const unitPrice = Number(item.unit_price) || 0;

                if (!productId || quantity <= 0 || unitPrice < 0) {
                    throw new Error(`Item inválido no carrinho: produto ID ${item.product_id}, quantidade ${item.quantity}`);
                }

                // Insere o item da venda
                await connection.execute<ResultSetHeader>(
                    `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`,
                    [saleId, productId, quantity, unitPrice]
                );

                // Atualiza o estoque do produto
                await connection.execute<ResultSetHeader>(
                    `UPDATE products SET stock = stock - ? WHERE id = ?`,
                    [quantity, productId]
                );
            }

            await connection.commit();
            return { success: true, saleId };

        } catch (error) {
            await connection.rollback();
            console.error("Erro na transação da venda (rollback executado):", error);
            throw error;

        } finally {
            connection.release();
        }
    }
};