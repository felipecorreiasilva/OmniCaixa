import { Calculator, Check, DollarSign, X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  const [amountPaidStr, setAmountPaidStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const amountPaid = parseFloat(amountPaidStr) || 0;
  const change = amountPaid - totalAmount;
  const isValidPayment = amountPaid >= totalAmount;

  const handleConfirm = async () => {
    if (!isValidPayment || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Envia "money" exatamente igual ao website
      await onConfirmSale("money", amountPaid, change);
      setAmountPaidStr("");
      onClose();
    } catch (error) {
      console.error("Erro ao finalizar venda em dinheiro:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickNominals = [10, 20, 50, 100];

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View className="flex-1 bg-black/70 justify-center items-center p-4">
        <View className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Cabeçalho */}
          <View className="flex-row justify-between items-center px-5 py-4 bg-zinc-950 border-b border-zinc-800">
            <View className="flex-row items-center gap-2">
              <DollarSign size={20} color="#10b981" />
              <Text className="text-emerald-400 font-bold text-base">Pagamento em Dinheiro</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1 bg-zinc-900 rounded-lg">
              <X size={18} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          {/* Corpo do Modal */}
          <View className="p-5 gap-4">
            
            {/* Total a Pagar */}
            <View className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 flex-row justify-between items-center">
              <Text className="text-xs font-medium text-zinc-400">Total a Pagar:</Text>
              <Text className="text-xl font-extrabold text-white">
                R$ {totalAmount.toFixed(2)}
              </Text>
            </View>

            {/* Valor Recebido do Cliente */}
            <View className="gap-1.5">
              <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Valor Recebido (R$)
              </Text>
              <View className="relative flex-row items-center">
                <Text className="absolute left-4 text-zinc-400 font-bold text-base z-10">R$</Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#52525b"
                  value={amountPaidStr}
                  onChangeText={setAmountPaidStr}
                  autoFocus
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white text-lg font-bold"
                />
              </View>
            </View>

            {/* Atalhos de Cédulas Rápidas */}
            <View className="flex-row gap-1.5">
              {quickNominals.map((val) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => setAmountPaidStr(val.toString())}
                  className="flex-1 py-2 bg-zinc-950 border border-zinc-800 items-center rounded-xl active:bg-zinc-800"
                >
                  <Text className="text-xs font-semibold text-zinc-300">R$ {val}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setAmountPaidStr(totalAmount.toFixed(2))}
                className="flex-1 py-2 bg-emerald-500/10 border border-emerald-500/20 items-center rounded-xl active:bg-emerald-500/20"
              >
                <Text className="text-xs font-semibold text-emerald-400">Exato</Text>
              </TouchableOpacity>
            </View>

            {/* Quadro de Cálculo de Troco */}
            <View
              className={`p-3.5 rounded-2xl border ${
                amountPaid === 0
                  ? "bg-zinc-950 border-zinc-800"
                  : isValidPayment
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-1.5">
                  <Calculator size={14} color={isValidPayment ? "#10b981" : "#f87171"} />
                  <Text className="text-xs font-semibold text-zinc-400 uppercase">Troco:</Text>
                </View>
                <Text
                  className={`text-base font-extrabold ${
                    isValidPayment ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {isValidPayment ? `R$ ${change.toFixed(2)}` : "Valor insuficiente"}
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
              disabled={!isValidPayment || isSubmitting}
              onPress={handleConfirm}
              className="flex-1 py-3 bg-emerald-600 rounded-xl items-center flex-row justify-center gap-1.5 opacity-90 active:opacity-100 disabled:opacity-30"
            >
              <Check size={16} color="#ffffff" />
              <Text className="text-white font-semibold text-xs">
                {isSubmitting ? "Finalizando..." : "Confirmar"}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}