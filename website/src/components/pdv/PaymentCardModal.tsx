"use client";

import { useState } from "react";
import { CreditCard, X, CheckCircle, ShieldCheck } from "lucide-react";

interface PaymentCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirmSale: (method: string) => void;
}

export default function PaymentCardModal({
  isOpen,
  onClose,
  totalAmount,
  onConfirmSale,
}: PaymentCardModalProps) {
  const [cardType, setCardType] = useState<"credito" | "debito">("debito");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Em vez de "Cartão de Crédito", enviamos uma chave técnica limpa
      const paymentMethod = cardType === "credito" ? "credit_card" : "debit_card";
      await onConfirmSale(paymentMethod);
      onClose();
    } catch (error) {
      console.error("Erro ao finalizar venda com cartão:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 text-cyan-600 font-bold text-lg">
            <CreditCard size={22} />
            <span>Pagamento via Maquininha</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-4">
          
          {/* Valor da Compra */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Total a Pagar:</span>
            <span className="text-2xl font-extrabold text-cyan-600">
              R$ {totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Seleção do Tipo de Cartão */}
          <div className="space-y-3 py-2">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Selecione a Operação
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCardType("debito")}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition cursor-pointer ${
                  cardType === "debito"
                    ? "border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Débito
              </button>
              <button
                type="button"
                onClick={() => setCardType("credito")}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition cursor-pointer ${
                  cardType === "credito"
                    ? "border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Crédito
              </button>
            </div>

            <div className="bg-cyan-50/50 border border-cyan-100 rounded-xl p-3 flex items-start gap-2 mt-3">
              <ShieldCheck size={18} className="text-cyan-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600">
                Passe ou insira o cartão na maquininha externa e confirme que a transação foi aprovada antes de concluir no sistema.
              </p>
            </div>
          </div>

        </div>

        {/* Rodapé / Ações */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer border border-slate-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm rounded-xl transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
          >
            <CheckCircle size={18} />
            {isSubmitting ? "A confirmar..." : "Confirmar Aprovação"}
          </button>
        </div>

      </div>
    </div>
  );
}