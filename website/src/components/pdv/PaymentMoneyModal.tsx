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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
            <DollarSign size={22} />
            <span>Pagamento em Dinheiro</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-5">
          
          {/* Total da Compra */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Total a Pagar:</span>
            <span className="text-2xl font-extrabold text-slate-900">
              R$ {totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Valor Entregue pelo Cliente */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Valor Recebido do Cliente (R$)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amountPaidStr}
                onChange={(e) => setAmountPaidStr(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-lg font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
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
                className="flex-1 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg transition"
              >
                R$ {val}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAmountPaidStr(totalAmount.toFixed(2))}
              className="flex-1 py-1.5 bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 rounded-lg hover:bg-emerald-100 transition"
            >
              Exato
            </button>
          </div>

          {/* Quadro de Cálculo de Troco */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              amountPaid === 0
                ? "bg-slate-50 border-slate-200"
                : isValidPayment
                ? "bg-emerald-50/60 border-emerald-200"
                : "bg-red-50/60 border-red-200"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-600 uppercase flex items-center gap-1">
                <Calculator size={14} /> Troco do Cliente:
              </span>
              <span
                className={`text-xl font-extrabold ${
                  isValidPayment ? "text-emerald-700" : "text-red-600"
                }`}
              >
                {isValidPayment ? `R$ ${change.toFixed(2)}` : "Valor insuficiente"}
              </span>
            </div>
          </div>

        </div>

        {/* Rodapé / Ações */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!isValidPayment || isSubmitting}
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <CheckCircle size={18} />
            {isSubmitting ? "Finalizando..." : "Confirmar Venda"}
          </button>
        </div>

      </div>
    </div>
  );
}