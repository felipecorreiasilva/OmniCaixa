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

export interface UpdateSaleInput {
    payment_method?: string;
    total_amount?: number;
    amount_paid?: number | null;
    change?: number;
    status?: 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA';
    txid?: string | null;
}

export const SaleModel = {
    // ==========================================
    // CREATE (Criar Venda + Baixa no Estoque)
    // ==========================================
    async create(data: CreateSaleInput): Promise<{ success: boolean; saleId: number }> {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

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
            
            const status = data.status || 'CONCLUIDA';
            if (!['PENDENTE', 'CONCLUIDA', 'CANCELADA'].includes(status)) {
                throw new Error("Status da venda inválido ou não informado.");
            }

            const items = Array.isArray(data.items) ? data.items : [];
            if (items.length === 0) {
                throw new Error("A venda não pode ser finalizada sem itens.");
            }

            // Insere o cabeçalho da venda
            const [saleResult] = await connection.execute<ResultSetHeader>(
                `INSERT INTO sales (total_amount, payment_method, amount_paid, \`change\`, txid, status) VALUES (?, ?, ?, ?, ?, ?)`,
                [totalAmount, paymentMethod, amountPaid, saleChange, txid, status]
            );

            const saleId = saleResult.insertId;

            // Insere os itens e atualiza o stock
            for (const item of items) {
                const productId = Number(item.product_id);
                const quantity = Number(item.quantity) || 0;
                const unitPrice = Number(item.unit_price) || 0;

                if (!productId || quantity <= 0 || unitPrice < 0) {
                    throw new Error(`Item inválido no carrinho: produto ID ${item.product_id}, quantidade ${item.quantity}`);
                }

                await connection.execute<ResultSetHeader>(
                    `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`,
                    [saleId, productId, quantity, unitPrice]
                );

                // Dá baixa no stock apenas se a venda for concluída
                if (status === 'CONCLUIDA') {
                    await connection.execute<ResultSetHeader>(
                        `UPDATE products SET stock = stock - ? WHERE id = ?`,
                        [quantity, productId]
                    );
                }
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
    },

    // ==========================================
    // READ (Listar Todas as Vendas)
    // ==========================================
    async findAll(): Promise<any[]> {
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT * FROM sales ORDER BY created_at DESC`
        );
        return rows;
    },

    // ==========================================
    // READ (Buscar Venda por ID com os Itens)
    // ==========================================
    async findById(id: number): Promise<any | null> {
        const [sales] = await db.execute<RowDataPacket[]>(
            `SELECT * FROM sales WHERE id = ?`,
            [id]
        );

        if (sales.length === 0) return null;

        const sale = sales[0];

        const [items] = await db.execute<RowDataPacket[]>(
            `SELECT si.*, p.name as product_name 
             FROM sale_items si 
             LEFT JOIN products p ON si.product_id = p.id 
             WHERE si.sale_id = ?`,
            [id]
        );

        return {
            ...sale,
            items
        };
    },

    // ==========================================
    // UPDATE (Atualizar Dados ou Status da Venda)
    // ==========================================
    async update(id: number, data: UpdateSaleInput): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.payment_method !== undefined) {
            fields.push("payment_method = ?");
            values.push(data.payment_method);
        }
        if (data.total_amount !== undefined) {
            fields.push("total_amount = ?");
            values.push(data.total_amount);
        }
        if (data.amount_paid !== undefined) {
            fields.push("amount_paid = ?");
            values.push(data.amount_paid);
        }
        if (data.change !== undefined) {
            fields.push("\`change\` = ?");
            values.push(data.change);
        }
        if (data.status !== undefined) {
            fields.push("status = ?");
            values.push(data.status);
        }
        if (data.txid !== undefined) {
            fields.push("txid = ?");
            values.push(data.txid);
        }

        if (fields.length === 0) return false;

        values.push(id);

        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE sales SET ${fields.join(", ")} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    },

    // ==========================================
    // DELETE / CANCELAR (Remove ou Cancela Venda e Repõe Stock)
    // ==========================================
    async cancel(id: number): Promise<boolean> {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Verifica se a venda existe e qual o estado atual
            const [sales] = await connection.execute<RowDataPacket[]>(
                `SELECT * FROM sales WHERE id = ?`,
                [id]
            );

            if (sales.length === 0) {
                throw new Error("Venda não encontrada.");
            }

            const sale = sales[0];
            if (sale.status === 'CANCELADA') {
                throw new Error("Esta venda já se encontra cancelada.");
            }

            // 2. Busca os itens da venda para devolver as quantidades ao stock
            const [items] = await connection.execute<RowDataPacket[]>(
                `SELECT * FROM sale_items WHERE sale_id = ?`,
                [id]
            );

            for (const item of items) {
                await connection.execute<ResultSetHeader>(
                    `UPDATE products SET stock = stock + ? WHERE id = ?`,
                    [item.quantity, item.product_id]
                );
            }

            // 3. Atualiza o status da venda para CANCELADA
            await connection.execute<ResultSetHeader>(
                `UPDATE sales SET status = 'CANCELADA' WHERE id = ?`,
                [id]
            );

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            console.error("Erro ao cancelar a venda:", error);
            throw error;
        } finally {
            connection.release();
        }
    }
};