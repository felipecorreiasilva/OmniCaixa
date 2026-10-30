import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { LogOut, Menu, Shield, User as UserIcon } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  onOpenSidebar?: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <View className="h-16 bg-zinc-950 px-4 flex-row items-center justify-between border-b border-zinc-800 shadow-md">
      
      {/* Lado Esquerdo: Botão Menu Mobile e Logótipo */}
      <View className="flex-row items-center gap-3">
        {onOpenSidebar && (
          <TouchableOpacity 
            onPress={onOpenSidebar}
            className="text-gray-400 p-1"
          >
            <Menu size={24} color="#9ca3af" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          onPress={() => router.replace('/(dashboard)')}
          className="flex-row items-center gap-2"
        >
          <View className="w-8 h-8 rounded-xl bg-cyan-500/10 items-center justify-center border border-cyan-500/20">
            <Text className="font-bold text-cyan-400 text-sm">O</Text>
          </View>
          <Text className="font-bold text-base tracking-wide text-gray-100">
            Omni<Text className="text-cyan-400">Caixa</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lado Direito: Informações do Utilizador e Botão de Logout */}
      <View className="flex-row items-center gap-3">
        
        {/* Detalhes do Utilizador */}
        <View className="flex-row items-center gap-2.5 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
          <View className="w-7 h-7 rounded-full bg-cyan-500/10 items-center justify-center border border-cyan-500/20">
            <UserIcon size={14} color="#38bdf8" />
          </View>
          <View className="items-start">
            <Text className="text-xs font-semibold text-gray-200 leading-tight">
              {user?.name || "Operador"}
            </Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <Shield size={10} color="#38bdf8" />
              <Text className="text-[9px] text-cyan-400 font-medium uppercase tracking-wider">
                {user?.role || "Funcionário"}
              </Text>
            </View>
          </View>
        </View>

        {/* Botão de Terminar Sessão (Logout) */}
        <TouchableOpacity
          onPress={logout}
          className="flex-row items-center gap-1 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl"
        >
          <LogOut size={15} color="#f87171" />
        </TouchableOpacity>

      </View>

    </View>
  );
}