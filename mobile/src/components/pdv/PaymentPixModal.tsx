import { pixService } from "@/services/pixService";
import * as Clipboard from 'expo-clipboard';
import { Check, Copy, QrCode, Smartphone, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, Text, TouchableOpacity, View } from "react-native";

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
        setTxid(data.txid);
      }
    } catch (error) {
      console.error("Erro ao gerar Pix:", error);
    } finally {
      setLoadingPix(false);
    }
  }

  // 2. POLLING: Verifica o status do pagamento a cada 3 segundos
  useEffect(() => {
    if (!isOpen || !txid) return;

    const interval = setInterval(async () => {
      try {
        const response = await pixService.consultarStatusPix(txid);

        if (response && response.status === "CONCLUIDA") {
          clearInterval(interval);
          await onConfirmSale("pix"); 
          onClose(); 
        }
      } catch (error) {
        console.error("Erro ao verificar status do Pix:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, txid, onConfirmSale, onClose]);

  const handleCopyCode = async () => {
    if (pixCopyPaste) {
      await Clipboard.setStringAsync(pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View className="flex-1 bg-black/70 justify-center items-center p-4">
        <View className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Cabeçalho */}
          <View className="flex-row justify-between items-center px-5 py-4 bg-zinc-950 border-b border-zinc-800">
            <View className="flex-row items-center gap-2">
              <QrCode size={20} color="#38bdf8" />
              <Text className="text-cyan-400 font-bold text-base">Pagamento via Pix</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1 bg-zinc-900 rounded-lg">
              <X size={18} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          {/* Conteúdo */}
          <View className="p-5 gap-4">
            
            {/* Valor da Compra */}
            <View className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 flex-row justify-between items-center">
              <Text className="text-xs font-medium text-zinc-400">Total a Pagar:</Text>
              <Text className="text-xl font-extrabold text-cyan-400">
                R$ {totalAmount.toFixed(2)}
              </Text>
            </View>

            {/* Área do QR Code Dinâmico */}
            <View className="items-center justify-center gap-3">
              <View className="w-48 h-48 bg-white border border-cyan-500/30 rounded-2xl items-center justify-center p-2 shadow-inner">
                {loadingPix ? (
                  <View className="items-center gap-2">
                    <ActivityIndicator size="large" color="#0891b2" />
                    <Text className="text-[10px] text-zinc-500">A gerar Pix...</Text>
                  </View>
                ) : qrCodeBase64 ? (
                  <Image 
                    source={{ uri: qrCodeBase64 }} 
                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }} 
                  />
                ) : (
                  <Text className="text-xs text-red-400 text-center">Erro ao carregar QR Code</Text>
                )}
              </View>

              {/* Botão Pix Copia e Cola */}
              {pixCopyPaste && (
                <TouchableOpacity
                  onPress={handleCopyCode}
                  className="w-full py-3 px-3 bg-zinc-950 border border-zinc-800 rounded-xl flex-row items-center justify-center gap-2 active:bg-zinc-800"
                >
                  {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} color="#a1a1aa" />}
                  <Text className="text-xs font-semibold text-zinc-200">
                    {copied ? "Código Pix Copiado!" : "Copiar Código Pix (Copia e Cola)"}
                  </Text>
                </TouchableOpacity>
              )}

              <View className="flex-row items-center gap-1.5 pt-1">
                <Smartphone size={14} color="#38bdf8" />
                <Text className="text-xs text-zinc-400">Aguardando pagamento via Pix...</Text>
              </View>
            </View>

          </View>

          {/* Rodapé / Ações */}
          <View className="p-4 bg-zinc-950 border-t border-zinc-800 flex-row justify-end">
            <TouchableOpacity
              onPress={onClose}
              className="w-full py-3 bg-zinc-900 border border-zinc-800 rounded-xl items-center"
            >
              <Text className="text-zinc-300 font-semibold text-xs">Cancelar / Fechar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}