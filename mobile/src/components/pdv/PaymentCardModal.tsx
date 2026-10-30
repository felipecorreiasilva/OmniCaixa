import { Check, CreditCard, ShieldCheck, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

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
    <Modal visible={isOpen} transparent animationType="fade">
      <View className="flex-1 bg-black/70 justify-center items-center p-4">
        <View className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Cabeçalho */}
          <View className="flex-row justify-between items-center px-5 py-4 bg-zinc-950 border-b border-zinc-800">
            <View className="flex-row items-center gap-2">
              <CreditCard size={20} color="#38bdf8" />
              <Text className="text-cyan-400 font-bold text-base">Pagamento via Maquininha</Text>
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

            {/* Seleção do Tipo de Cartão */}
            <View className="gap-2">
              <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Selecione a Operação
              </Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setCardType("debito")}
                  className={`flex-1 py-3 px-4 rounded-xl border items-center ${
                    cardType === "debito"
                      ? "border-cyan-500 bg-cyan-500/10 shadow-sm"
                      : "border-zinc-800 bg-zinc-950"
                  }`}
                >
                  <Text className={`text-sm font-bold ${cardType === "debito" ? "text-cyan-400" : "text-zinc-400"}`}>
                    Débito
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCardType("credito")}
                  className={`flex-1 py-3 px-4 rounded-xl border items-center ${
                    cardType === "credito"
                      ? "border-cyan-500 bg-cyan-500/10 shadow-sm"
                      : "border-zinc-800 bg-zinc-950"
                  }`}
                >
                  <Text className={`text-sm font-bold ${cardType === "credito" ? "text-cyan-400" : "text-zinc-400"}`}>
                    Crédito
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 flex-row items-start gap-2.5 mt-2">
                <ShieldCheck size={18} color="#38bdf8" className="shrink-0 mt-0.5" />
                <Text className="text-xs text-zinc-300 flex-1 leading-relaxed">
                  Passe ou insira o cartão na maquininha externa e confirme que a transação foi aprovada antes de concluir no sistema.
                </Text>
              </View>
            </View>

          </View>

          {/* Rodapé / Ações */}
          <View className="p-4 bg-zinc-950 border-t border-zinc-800 flex-row gap-2">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3 bg-zinc-900 border border-zinc-800 rounded-xl items-center"
            >
              <Text className="text-zinc-300 font-semibold text-xs">Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isSubmitting}
              onPress={handleConfirm}
              className="flex-1 py-3 bg-cyan-600 rounded-xl items-center flex-row justify-center gap-1.5 opacity-90 active:opacity-100 disabled:opacity-40"
            >
              <Check size={16} color="#ffffff" />
              <Text className="text-white font-semibold text-xs">
                {isSubmitting ? "A confirmar..." : "Confirmar Aprovação"}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}