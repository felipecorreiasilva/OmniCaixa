import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { ArrowRight, Package, ShoppingCart, Sparkles, Users } from "lucide-react-native";
import { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function DashboardHomePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Nota: Em React Native puro, idealmente usarias o expo-secure-store ou AsyncStorage, 
    // mas mantemos a lógica caso estejas a usar localStorage/token via contexto.
    const checkToken = async () => {
      // Exemplo de verificação de segurança mobile
      if (!user) {
        router.replace("/(auth)/login");
      }
    };
    checkToken();
  }, [user]);

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
      
      {/* Cabeçalho de Boas-vindas com Estilo Dark Moderno */}
      <View className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm flex-col gap-4 relative overflow-hidden mb-6">
        {/* Detalhe decorativo de fundo */}
        <View className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <View className="relative z-10">
          <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 self-start mb-3">
            <Sparkles size={14} color="#38bdf8" />
            <Text className="text-cyan-400 text-xs font-semibold">Painel de Gestão</Text>
          </View>
          <Text className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Olá, <Text className="text-cyan-400">{user?.name || "Funcionário"}</Text> 👋
          </Text>
          <Text className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Bem-vindo ao painel de controlo do <Text className="font-medium text-zinc-200">OmniCaixa</Text>. Selecione uma opção abaixo para começar a gerir o seu negócio.
          </Text>
        </View>
      </View>

      {/* Atalhos Rápidos / Cards de Navegação */}
      <View className="gap-4">
        <Text className="text-sm font-bold text-zinc-200 tracking-tight">Acesso Rápido</Text>
        
        <View className="gap-4">
          
          {/* Card PDV (Frente de Caixa) */}
          <TouchableOpacity
            onPress={() => router.push("/(dashboard)/pdv")}
            className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 active:border-cyan-500/50 shadow-sm justify-between gap-4"
          >
            <View>
              <View className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl items-center justify-center mb-4">
                <ShoppingCart size={24} color="#38bdf8" />
              </View>
              <Text className="text-lg font-bold text-white">Frente de Caixa (PDV)</Text>
              <Text className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Iniciar vendas rápidas, consultar produtos em tempo real e processar pagamentos com segurança.
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5 pt-2 border-t border-zinc-800">
              <Text className="text-xs font-bold text-cyan-400">Abrir PDV</Text>
              <ArrowRight size={14} color="#38bdf8" />
            </View>
          </TouchableOpacity>

          {/* Card Produtos */}
          <TouchableOpacity
            onPress={() => router.push("/(dashboard)/products" as any)}
            className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 active:border-cyan-500/50 shadow-sm justify-between gap-4"
          >
            <View>
              <View className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl items-center justify-center mb-4">
                <Package size={24} color="#38bdf8" />
              </View>
              <Text className="text-lg font-bold text-white">Gestão de Produtos</Text>
              <Text className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Cadastrar novos itens, gerir o stock físico, controlar quantidades e atualizar preços facilmente.
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5 pt-2 border-t border-zinc-800">
              <Text className="text-xs font-bold text-zinc-300">Gerir Produtos</Text>
              <ArrowRight size={14} color="#a1a1aa" />
            </View>
          </TouchableOpacity>

          {/* Card Usuários / Funcionários */}
          <TouchableOpacity
            onPress={() => router.push("/(dashboard)/users" as any)}
            className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 active:border-cyan-500/50 shadow-sm justify-between gap-4"
          >
            <View>
              <View className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl items-center justify-center mb-4">
                <Users size={24} color="#38bdf8" />
              </View>
              <Text className="text-lg font-bold text-white">Funcionários</Text>
              <Text className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Administrar utilizadores, configurar controlos de acesso por cargo e gerir a equipa de operadores.
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5 pt-2 border-t border-zinc-800">
              <Text className="text-xs font-bold text-zinc-300">Ver Funcionários</Text>
              <ArrowRight size={14} color="#a1a1aa" />
            </View>
          </TouchableOpacity>

        </View>
      </View>

    </ScrollView>
  );
}