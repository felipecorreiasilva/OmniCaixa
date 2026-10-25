import {Request, Response} from 'express';
import { SaleModel } from '../models/salesModel';

export const SalesController = {
    async createSale(req: Request, res: Response){
        try {
            const { payment_method, total_amount, amount_paid, change, items } = req.body;

            // Validação básica (apenas o que é obrigatório para qualquer venda)
            if (!payment_method || total_amount === undefined || !Array.isArray(items)) {
                return res.status(400).json({ error: 'Dados da venda incompletos ou inválidos.' });
            }

            // Trata valores opcionais para evitar 'undefined' no MySQL
            const finalAmountPaid = amount_paid !== undefined ? amount_paid : null;
            const finalChange = change !== undefined ? change : 0;

            // Chama o Model com os valores tratados
            const result = await SaleModel.create({ 
                payment_method, 
                total_amount, 
                amount_paid: finalAmountPaid, 
                change: finalChange, 
                items
            });

            if (result.success) {
                return res.status(201).json({ message: 'Venda criada com sucesso!', saleId: result.saleId });
            } else {
                return res.status(500).json({ error: 'Falha ao criar a venda.' });
            }
        } catch (error) {
            console.error("Erro ao criar venda:", error);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }
}