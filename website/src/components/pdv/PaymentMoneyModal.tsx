"use client";

import { useState } from "react";
import { DollarSign, X, CheckCircle, Calculator } from "lucide-react";

interface PaymentMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirmSale: (method: string, amountPaid: number, change: number) => void;
}

export default function PaymentMoneyModal({
  isOpen,
  onClose,
  totalAmount,
  onConfirmSale,
}: PaymentMoneyModalProps) {
  const [amountPaidStr, setAmountPaidStr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const amountPaid = parseFloat(amountPaidStr) || 0;
  const change = amountPaid - totalAmount;
  const isValidPayment = amountPaid >= totalAmount;

  const handleConfirm = async () => {
    if (!isValidPayment || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirmSale("money", amountPaid, change);
      setAmountPaidStr("");
      onClose();
    } catch (error) {
      console.error("Erro ao finalizar venda em dinheiro:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Valores rápidos de cédulas para facilitar o operador
  const quickNominals = [10, 20, 50, 100];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center px-6 py-4 bg-zinc-950 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
            <DollarSign size={20} />
            <span>Pagamento em Dinheiro</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 bg-zinc-900 rounded-lg transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-4">
          
          {/* Total da Compra */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
            <span className="text-xs font-medium text-zinc-400">Total a Pagar:</span>
            <span className="text-xl font-extrabold text-white">
              R$ {totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Valor Entregue pelo Cliente */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Valor Recebido do Cliente (R$)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-zinc-400 font-bold text-base z-10">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amountPaidStr}
                onChange={(e) => setAmountPaidStr(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-lg font-bold placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
              />
            </div>
          </div>

          {/* Atalhos de Cédulas Rápidas */}
          <div className="flex gap-2">
            {quickNominals.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmountPaidStr(val.toString())}
                className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-800 hover:text-emerald-400 hover:border-emerald-500/50 border border-zinc-800 text-xs font-semibold text-zinc-300 rounded-xl transition cursor-pointer"
              >
                R$ {val}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAmountPaidStr(totalAmount.toFixed(2))}
              className="flex-1 py-2 bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition cursor-pointer"
            >
              Exato
            </button>
          </div>

          {/* Quadro de Cálculo de Troco */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              amountPaid === 0
                ? "bg-zinc-950 border-zinc-800"
                : isValidPayment
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-red-500/10 border-red-500/20"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400 uppercase flex items-center gap-1.5">
                <Calculator size={14} className={isValidPayment ? "text-emerald-400" : "text-red-400"} /> Troco do Cliente:
              </span>
              <span
                className={`text-base font-extrabold ${
                  isValidPayment ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {isValidPayment ? `R$ ${change.toFixed(2)}` : "Valor insuficiente"}
              </span>
            </div>
          </div>

        </div>

        {/* Rodapé / Ações */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-xs font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition cursor-pointer border border-zinc-800 text-center"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!isValidPayment || isSubmitting}
            onClick={handleConfirm}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm cursor-pointer"
          >
            <CheckCircle size={16} />
            {isSubmitting ? "Finalizando..." : "Confirmar Venda"}
          </button>
        </div>

      </div>
    </div>
  );
}