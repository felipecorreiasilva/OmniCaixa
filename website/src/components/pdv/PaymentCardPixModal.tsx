"use client";

import { useState, useEffect } from "react";
import { CreditCard, QrCode, X, CheckCircle, Smartphone, Loader2, Copy, Check } from "lucide-react";
import { pixService } from "@/services/pixService";

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

  // Estados para o Pix dinâmico da Efí Bank
  const [loadingPix, setLoadingPix] = useState(false);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [pixCopyPaste, setPixCopyPaste] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Assim que o modal abre na aba Pix, gera a cobrança na API via pixService
  useEffect(() => {
    if (isOpen && selectedTab === "pix") {
      generatePixCharge();
    }
  }, [isOpen, selectedTab, totalAmount]);

  async function generatePixCharge() {
    try {
      setLoadingPix(true);
      setQrCodeBase64(null);
      setPixCopyPaste(null);

      const data = await pixService.gerarCobrancaPix(totalAmount);

      if (data && data.success) {
        setQrCodeBase64(data.qrCodeImage);
        setPixCopyPaste(data.pixCopiaECola);
      }
    } catch (error) {
      console.error("Erro ao gerar Pix:", error);
    } finally {
      setLoadingPix(false);
    }
  }

  const handleCopyCode = () => {
    if (pixCopyPaste) {
      navigator.clipboard.writeText(pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

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

  if (!isOpen) return null;

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
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Abas Seleção: Pix ou Cartão */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 p-2 gap-2">
          <button
            type="button"
            onClick={() => setSelectedTab("pix")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              selectedTab === "pix"
                ? "bg-white text-cyan-600 border border-slate-200 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <QrCode size={16} /> Pix (QR Code)
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("cartao")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              selectedTab === "cartao"
                ? "bg-white text-cyan-600 border border-slate-200 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <CreditCard size={16} /> Maquininha
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

          {/* Conteúdo da Aba Pix */}
          {selectedTab === "pix" && (
            <div className="flex flex-col items-center justify-center py-1 space-y-3">
              <div className="w-44 h-44 bg-white border border-cyan-300 rounded-2xl flex flex-col items-center justify-center p-2 shadow-sm">
                {loadingPix ? (
                  <div className="flex flex-col items-center text-slate-400 space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                    <span className="text-[10px]">A gerar Pix...</span>
                  </div>
                ) : qrCodeBase64 ? (
                  <img src={qrCodeBase64} alt="QR Code Pix" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs text-red-500 text-center">Erro ao carregar QR Code</span>
                )}
              </div>

              {/* Botão Pix Copia e Cola */}
              {pixCopyPaste && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copied ? "Código Pix Copiado!" : "Copiar Código Pix (Copia e Cola)"}
                </button>
              )}

              <p className="text-xs text-slate-500 text-center flex items-center gap-1">
                <Smartphone size={14} className="text-cyan-600" />
                Aguardando leitura do QR Code pelo cliente...
              </p>
            </div>
          )}

          {/* Conteúdo da Aba Maquininha (Crédito / Débito) */}
          {selectedTab === "cartao" && (
            <div className="space-y-3 py-4">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Tipo da Transação na Maquininha
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
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSubmitting || (selectedTab === "pix" && loadingPix)}
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm rounded-xl transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
          >
            <CheckCircle size={18} />
            {isSubmitting ? "Confirmando..." : "Confirmar Pagamento"}
          </button>
        </div>

      </div>
    </div>
  );
}