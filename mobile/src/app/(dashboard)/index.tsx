import { useRouter } from 'expo-router';
import { ArrowRight, Package, ShoppingCart, Sparkles, Users } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
// Certifica-te de ajustar o caminho do teu AuthContext mobile se necessário
// import { useAuth } from '@/context/AuthContext';

export default function DashboardHomeScreen() {
  const router = useRouter();
  
  // Exemplo provisório (podes ligar ao teu AuthContext real do mobile)
  // const { user } = useAuth();
  const user = { name: 'Funcionário' };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-zinc-950 p-6">
      <View className="space-y-6 pb-10">
        
        {/* Cabeçalho de Boas-vindas com Estilo Moderno */}
        <View className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden">
          <View className="relative z-10">
            <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/50 self-start mb-3 border border-cyan-100 dark:border-cyan-900">
              <Sparkles size={14} color="#0891b2" />
              <Text className="text-cyan-600 dark:text-cyan-400 text-xs font-semibold">Painel de Gestão</Text>
            </View>
            
            <Text className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Olá, <Text className="text-cyan-600 dark:text-cyan-400">{user?.name || "Funcionário"}</Text> 👋
            </Text>
            
            <Text className="text-sm text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Bem-vindo ao painel de controlo do <Text className="font-medium text-slate-700 dark:text-zinc-200">OmniCaixa</Text>. Selecione uma opção abaixo para começar a gerir o seu negócio.
            </Text>
          </View>
        </View>

        {/* Atalhos Rápidos / Cards de Navegação */}
        <View className="space-y-4">
          <Text className="text-lg font-bold text-slate-800 dark:text-zinc-100 tracking-tight">
            Acesso Rápido
          </Text>

          <View className="gap-4">
            
            {/* Card PDV (Frente de Caixa) */}
            <TouchableOpacity
              onPress={() => router.push('/(dashboard)/pdv')}
              className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm active:scale-[0.98] transition-all flex-col justify-between"
            >
              <View>
                <View className="w-14 h-14 bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-100 dark:border-cyan-900 rounded-2xl items-center justify-center mb-5 shadow-sm">
                  <ShoppingCart size={26} color="#0891b2" />
                </View>
                <Text className="text-xl font-bold text-slate-900 dark:text-white">Frente de Caixa (PDV)</Text>
                <Text className="text-sm text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
                  Iniciar vendas rápidas, consultar produtos em tempo real e processar pagamentos com segurança.
                </Text>
              </View>
              <View className="mt-6 flex-row items-center gap-2">
                <Text className="text-xs font-bold text-cyan-600 dark:text-cyan-400">Abrir PDV</Text>
                <ArrowRight size={16} color="#0891b2" />
              </View>
            </TouchableOpacity>

            {/* Card Produtos */}
            <TouchableOpacity
              onPress={() => router.push('/(dashboard)/products')}
              className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm active:scale-[0.98] transition-all flex-col justify-between"
            >
              <View>
                <View className="w-14 h-14 bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-100 dark:border-cyan-900 rounded-2xl items-center justify-center mb-5 shadow-sm">
                  <Package size={26} color="#0891b2" />
                </View>
                <Text className="text-xl font-bold text-slate-900 dark:text-white">Gestão de Produtos</Text>
                <Text className="text-sm text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
                  Cadastrar novos itens, gerir o stock físico, controlar quantidades e atualizar preços facilmente.
                </Text>
              </View>
              <View className="mt-6 flex-row items-center gap-2">
                <Text className="text-xs font-bold text-slate-700 dark:text-zinc-300">Gerir Produtos</Text>
                <ArrowRight size={16} color="#64748b" />
              </View>
            </TouchableOpacity>

            {/* Card Usuários */}
            <TouchableOpacity
              onPress={() => router.push('/(dashboard)/users')}
              className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm active:scale-[0.98] transition-all flex-col justify-between"
            >
              <View>
                <View className="w-14 h-14 bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-100 dark:border-cyan-900 rounded-2xl items-center justify-center mb-5 shadow-sm">
                  <Users size={26} color="#0891b2" />
                </View>
                <Text className="text-xl font-bold text-slate-900 dark:text-white">Funcionários</Text>
                <Text className="text-sm text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
                  Administrar utilizadores, configurar controlos de acesso por cargo e gerir a equipa de operadores.
                </Text>
              </View>
              <View className="mt-6 flex-row items-center gap-2">
                <Text className="text-xs font-bold text-slate-700 dark:text-zinc-300">Ver Funcionários</Text>
                <ArrowRight size={16} color="#64748b" />
              </View>
            </TouchableOpacity>

          </View>
        </View>

      </View>
    </ScrollView>
  );
}