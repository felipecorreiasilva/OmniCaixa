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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center px-6 py-4 bg-zinc-950 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
            <CreditCard size={20} />
            <span>Pagamento via Maquininha</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 bg-zinc-900 rounded-lg transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-4">
          
          {/* Valor da Compra */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
            <span className="text-xs font-medium text-zinc-400">Total a Pagar:</span>
            <span className="text-xl font-extrabold text-cyan-400">
              R$ {totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Seleção do Tipo de Cartão */}
          <div className="space-y-3 py-1">
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Selecione a Operação
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCardType("debito")}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition cursor-pointer ${
                  cardType === "debito"
                    ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-sm"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                Débito
              </button>
              <button
                type="button"
                onClick={() => setCardType("credito")}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition cursor-pointer ${
                  cardType === "credito"
                    ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-sm"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                Crédito
              </button>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-3.5 flex items-start gap-2.5 mt-2">
              <ShieldCheck size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-300 leading-relaxed">
                Passe ou insira o cartão na maquininha externa e confirme que a transação foi aprovada antes de concluir no sistema.
              </p>
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
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
          >
            <CheckCircle size={16} />
            {isSubmitting ? "A confirmar..." : "Confirmar Aprovação"}
          </button>
        </div>

      </div>
    </div>
  );
}