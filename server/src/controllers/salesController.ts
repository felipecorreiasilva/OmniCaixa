import { Request, Response } from 'express';
import { SaleModel } from '../models/salesModel';

export const SalesController = {
    // ==========================================
    // CREATE (Criar Nova Venda / PDV)
    // ==========================================
    async createSale(req: Request, res: Response) {
        try {
            const { payment_method, total_amount, amount_paid, change, items, txid } = req.body;

            // Validação básica
            if (!payment_method || total_amount === undefined || !Array.isArray(items)) {
                return res.status(400).json({ error: 'Dados da venda incompletos ou inválidos.' });
            }

            // Trata valores opcionais
            const finalAmountPaid = amount_paid !== undefined ? amount_paid : null;
            const finalChange = change !== undefined ? change : 0;

            // REGRA DE STATUS: 
            // Se for Dinheiro ou Cartão, já nasce 'CONCLUIDA'. 
            // Se for Pix, nasce 'PENDENTE' (e guarda o txid se houver).
            const isPix = payment_method.toLowerCase().includes('pix');
            const initialStatus = isPix ? 'PENDENTE' : 'CONCLUIDA';
            const finalTxid = isPix && txid ? txid : null;

            // Chama o Model com os valores tratados
            const result = await SaleModel.create({ 
                payment_method, 
                total_amount, 
                amount_paid: finalAmountPaid, 
                change: finalChange, 
                items,
                txid: finalTxid,
                status: initialStatus
            });

            if (result.success) {
                return res.status(201).json({ 
                    message: 'Venda criada com sucesso!', 
                    saleId: result.saleId,
                    status: initialStatus 
                });
            } else {
                return res.status(500).json({ error: 'Falha ao criar a venda.' });
            }
        } catch (error: any) {
            console.error("Erro ao criar venda:", error);
            return res.status(500).json({ error: error.message || 'Erro interno do servidor.' });
        }
    },

    // ==========================================
    // READ (Listar Todas as Vendas)
    // ==========================================
    async getAllSales(req: Request, res: Response) {
        try {
            const sales = await SaleModel.findAll();
            return res.status(200).json(sales);
        } catch (error) {
            console.error("Erro ao listar vendas:", error);
            return res.status(500).json({ error: 'Erro interno ao buscar as vendas.' });
        }
    },

    // ==========================================
    // READ (Buscar Venda por ID com Itens)
    // ==========================================
    async getSaleById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const sale = await SaleModel.findById(Number(id));

            if (!sale) {
                return res.status(404).json({ error: 'Venda não encontrada.' });
            }

            return res.status(200).json(sale);
        } catch (error) {
            console.error("Erro ao buscar venda por ID:", error);
            return res.status(500).json({ error: 'Erro interno ao buscar detalhes da venda.' });
        }
    },

    // ==========================================
    // DELETE / CANCELAR (Cancela Venda e Repõe Stock)
    // ==========================================
    async cancelSale(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await SaleModel.cancel(Number(id));

            return res.status(200).json({ 
                success: true, 
                message: 'Venda cancelada com sucesso e estoque reposto.' 
            });
        } catch (error: any) {
            console.error("Erro ao cancelar venda:", error);
            return res.status(400).json({ error: error.message || 'Erro ao cancelar a venda.' });
        }
    }
};