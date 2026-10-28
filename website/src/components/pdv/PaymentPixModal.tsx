"use client";

import { useState, useEffect } from "react";
import { QrCode, X, Smartphone, Loader2, Copy, Check } from "lucide-react";
import { pixService } from "@/services/pixService";

interface PaymentPixModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirmSale: (method: string) => void;
}

export default function PaymentPixModal({
  isOpen,
  onClose,
  totalAmount,
  onConfirmSale,
}: PaymentPixModalProps) {
  const [loadingPix, setLoadingPix] = useState(false);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [pixCopyPaste, setPixCopyPaste] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [txid, setTxid] = useState<string | null>(null);

  // 1. Assim que o modal abre, gera a cobrança Pix
  useEffect(() => {
    if (isOpen) {
      generatePixCharge();
    }
  }, [isOpen, totalAmount]);

  async function generatePixCharge() {
    try {
      setLoadingPix(true);
      setQrCodeBase64(null);
      setPixCopyPaste(null);
      setTxid(null);

      const data = await pixService.gerarCobrancaPix(totalAmount);

      if (data && data.success) {
        setQrCodeBase64(data.qrCodeImage);
        setPixCopyPaste(data.pixCopiaECola);
        setTxid(data.txid); // Guarda o txid para verificarmos o status a seguir
      }
    } catch (error) {
      console.error("Erro ao gerar Pix:", error);
    } finally {
      setLoadingPix(false);
    }
  }

  // 2. POLLING: Fica a verificar o status do pagamento a cada 3 segundos enquanto o modal estiver aberto
  useEffect(() => {
    if (!isOpen || !txid) return;

    const interval = setInterval(async () => {
      try {
        const response = await pixService.consultarStatusPix(txid);

        // Se o banco confirmar que o Pix foi pago (status CONCLUIDA)
        if (response && response.status === "CONCLUIDA") {
          clearInterval(interval);
          await onConfirmSale("pix"); // Regista a venda no sistema
          onClose(); // Fecha o modal automaticamente
        }
      } catch (error) {
        console.error("Erro ao verificar status do Pix:", error);
      }
    }, 3000); // 3000ms = 3 segundos

    // Limpa o intervalo quando o modal fecha ou o componente é desmontado
    return () => clearInterval(interval);
  }, [isOpen, txid, onConfirmSale, onClose]);

  const handleCopyCode = () => {
    if (pixCopyPaste) {
      navigator.clipboard.writeText(pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 text-cyan-600 font-bold text-lg">
            <QrCode size={22} />
            <span>Pagamento via Pix</span>
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

          {/* Área do QR Code Dinâmico */}
          <div className="flex flex-col items-center justify-center py-1 space-y-3">
            <div className="w-48 h-48 bg-white border border-cyan-300 rounded-2xl flex flex-col items-center justify-center p-2 shadow-sm">
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
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? "Código Pix Copiado!" : "Copiar Código Pix (Copia e Cola)"}
              </button>
            )}

            <p className="text-xs text-slate-500 text-center flex items-center gap-1 pt-1">
              <Smartphone size={14} className="text-cyan-600" />
              Aguardando pagamento via Pix...
            </p>
          </div>

        </div>

        {/* Rodapé / Ações */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer border border-slate-200"
          >
            Cancelar / Fechar
          </button>
        </div>

      </div>
    </div>
  );
}