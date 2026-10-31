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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center px-6 py-4 bg-zinc-950 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
            <QrCode size={20} />
            <span>Pagamento via Pix</span>
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

          {/* Área do QR Code Dinâmico */}
          <div className="flex flex-col items-center justify-center py-1 space-y-3">
            <div className="w-48 h-48 bg-white border border-zinc-700 rounded-2xl flex flex-col items-center justify-center p-2 shadow-sm">
              {loadingPix ? (
                <div className="flex flex-col items-center text-zinc-500 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                  <span className="text-[10px] font-medium">A gerar Pix...</span>
                </div>
              ) : qrCodeBase64 ? (
                <img src={qrCodeBase64} alt="QR Code Pix" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-red-500 text-center font-medium">Erro ao carregar QR Code</span>
              )}
            </div>

            {/* Botão Pix Copia e Cola */}
            {pixCopyPaste && (
              <button
                type="button"
                onClick={handleCopyCode}
                className="w-full py-3 px-4 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer border border-zinc-800"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-cyan-400" />}
                {copied ? "Código Pix Copiado!" : "Copiar Código Pix (Copia e Cola)"}
              </button>
            )}

            <p className="text-xs text-zinc-400 text-center flex items-center gap-1.5 pt-1">
              <Smartphone size={14} className="text-cyan-400" />
              Aguardando pagamento via Pix...
            </p>
          </div>

        </div>

        {/* Rodapé / Ações */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-xs font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition cursor-pointer border border-zinc-800 text-center"
          >
            Cancelar / Fechar
          </button>
        </div>

      </div>
    </div>
  );
}