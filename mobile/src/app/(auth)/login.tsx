import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { useRouter } from 'expo-router';
import { Lock, Mail, Store } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Se o utilizador já estiver logado, redireciona automaticamente para o dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/(dashboard)/pdv');
    }
  }, [user, authLoading, router]);

  // Enquanto o contexto valida a sessão, mostra um ecrã de carregamento limpo
  if (authLoading) {
    return (
      <View className="flex-1 bg-blue-950 items-center justify-center">
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Por favor, preenche o e-mail e a palavra-passe.');
      return;
    }

    try {
      setLoading(true);
      
      // 1. Faz a chamada ao backend
      const response = await authService.login({ email, password });
      
      // 2. Salva no contexto de autenticação global e armazena localmente
      login(response.token, response.user);

      // 3. Sucesso: redireciona para o painel de PDV
      router.replace('/(dashboard)/pdv');
    } catch (error: any) {
      console.error("ERRO COMPLETO DO AXIOS:", error);
      
      // Isto vai mostrar exatamente se deu Network Error ou 401 Unauthorized
      const errorMsg = error.message === 'Network Error' 
        ? 'Não foi possível conectar ao servidor (Verifique o IP e o Wi-Fi).' 
        : (error.response?.data?.error || error.response?.data?.message || 'Erro desconhecido');

      Alert.alert('Detalhe do Erro', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-blue-600 dark:bg-blue-950 justify-center flex-row">
      <SafeAreaView className="flex-1 px-6 justify-between py-8 max-w-lg w-full">
        
        {/* Cabeçalho com Logo */}
        <View className="pt-8 items-center gap-2">
          <View className="w-14 h-14 bg-white/10 rounded-full items-center justify-center mb-1 border border-white/20">
            <Store size={28} color="#ffffff" />
          </View>
          <Text className="text-3xl font-extrabold text-white text-center tracking-tight">
            OmniCaixa
          </Text>
          <Text className="text-sm text-blue-100 text-center">
            Entre com suas credenciais para acessar o PDV
          </Text>
        </View>

        {/* Formulário de Login */}
        <View className="gap-4 w-full">
          
          {/* Campo de E-mail */}
          <View className="gap-1.5">
            <Text className="text-xs font-semibold text-blue-100 uppercase tracking-wider ml-1">
              E-mail
            </Text>
            <View className="relative justify-center">
              {/* CORRIGIDO: <span> substituído por <View> */}
              <View className="absolute left-4 z-10">
                <Mail size={18} color="#93c5fd" />
              </View>
              <TextInput
                className="w-full bg-white/10 dark:bg-zinc-900 border border-blue-400/30 pl-11 pr-4 py-4 rounded-xl text-white placeholder:text-blue-200/50 text-base"
                placeholder="exemplo@omnicaixa.com"
                placeholderTextColor="#93c5fd80"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Campo de Palavra-passe */}
          <View className="gap-1.5">
            <Text className="text-xs font-semibold text-blue-100 uppercase tracking-wider ml-1">
              Palavra-passe
            </Text>
            <View className="relative justify-center">
              {/* CORRIGIDO: <span> substituído por <View> */}
              <View className="absolute left-4 z-10">
                <Lock size={18} color="#93c5fd" />
              </View>
              <TextInput
                className="w-full bg-white/10 dark:bg-zinc-900 border border-blue-400/30 pl-11 pr-4 py-4 rounded-xl text-white placeholder:text-blue-200/50 text-base"
                placeholder="••••••••"
                placeholderTextColor="#93c5fd80"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Botão de Submissão */}
          <TouchableOpacity
            className="w-full bg-white dark:bg-zinc-900 py-4 rounded-xl items-center justify-center active:opacity-90 shadow-sm mt-4 flex-row gap-2"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <Text className="text-blue-600 dark:text-white font-semibold text-base">
                A entrar...
              </Text>
            ) : (
              <Text className="text-blue-600 dark:text-white font-semibold text-base">
                Acessar Sistema
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Rodapé / Voltar */}
        <View className="items-center pb-4 gap-2">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-sm text-blue-200 font-medium">
              ← Voltar ao início
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-blue-300/70">
            OmniCaixa POS &bull; Uso exclusivo para colaboradores
          </Text>
        </View>

      </SafeAreaView>
    </View>
  );
}