"use client";

import { useState } from "react";
import { CreditCard, QrCode, X, CheckCircle, Smartphone } from "lucide-react";

interface PaymentCardPixModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirmSale: (method: string) => void;
}

export default function PaymentCardPixModal({
  isOpen,
  onClose,
  totalAmount,
  onConfirmSale,
}: PaymentCardPixModalProps) {
  const [selectedTab, setSelectedTab] = useState<"pix" | "cartao">("pix");
  const [cardType, setCardType] = useState<"credito" | "debito">("debito");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const paymentMethod =
        selectedTab === "pix"
          ? "Pix"
          : cardType === "credito"
          ? "Cartão de Crédito"
          : "Cartão de Débito";

      await onConfirmSale(paymentMethod);
      onClose();
    } catch (error) {
      console.error("Erro ao finalizar venda em cartão/pix:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 text-cyan-600 font-bold text-lg">
            <CreditCard size={22} />
            <span>Pagamento Cartão / Pix</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Abas Seleção: Pix ou Cartão */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 p-2 gap-2">
          <button
            onClick={() => setSelectedTab("pix")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              selectedTab === "pix"
                ? "bg-white text-cyan-600 border border-slate-200 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <QrCode size={16} /> Pix (QR Code)
          </button>
          <button
            onClick={() => setSelectedTab("cartao")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              selectedTab === "cartao"
                ? "bg-white text-cyan-600 border border-slate-200 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <CreditCard size={16} /> Maquininha
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-5">
          
          {/* Valor da Compra */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Total a Pagar:</span>
            <span className="text-2xl font-extrabold text-cyan-600">
              R$ {totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Conteúdo da Aba Pix */}
          {selectedTab === "pix" && (
            <div className="flex flex-col items-center justify-center py-2 space-y-3">
              <div className="w-44 h-44 bg-slate-100 border-2 border-dashed border-cyan-300 rounded-2xl flex flex-col items-center justify-center p-2 text-center shadow-inner">
                {/* Exemplo de QR Code estático / Placeholder para integrar com API do banco */}
                <QrCode size={100} className="text-slate-800" />
                <span className="text-[10px] font-semibold text-slate-500 mt-1">
                  Escaneie para Pagar
                </span>
              </div>
              <p className="text-xs text-slate-500 text-center flex items-center gap-1">
                <Smartphone size={14} className="text-cyan-600" />
                Aguardando leitura do QR Code pelo cliente...
              </p>
            </div>
          )}

          {/* Conteúdo da Aba Maquininha (Crédito / Débito) */}
          {selectedTab === "cartao" && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Tipo da Transação na Maquininha
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCardType("debito")}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition ${
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
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition ${
                    cardType === "credito"
                      ? "border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Crédito
                </button>
              </div>
              <p className="text-xs text-slate-400 text-center pt-2">
                Passe o cartão na maquininha e confirme a transação após a aprovação.
              </p>
            </div>
          )}

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
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm rounded-xl transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <CheckCircle size={18} />
            {isSubmitting ? "Confirmando..." : "Confirmar Pagamento"}
          </button>
        </div>

      </div>
    </div>
  );
}