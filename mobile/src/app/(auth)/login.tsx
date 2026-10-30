import { authService } from '@/services/authService';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preenche o e-mail e a palavra-passe.');
      return;
    }

    try {
      setLoading(true);
      
      // Correção: Passar um objeto com email e password conforme a tipagem do authService
      await authService.login({ email, password });

      // Sucesso: redireciona para o painel de PDV
      router.replace('/(dashboard)/pdv');
    } catch (error) {
      Alert.alert('Erro no Login', 'Credenciais inválidas ou erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-blue-600 dark:bg-blue-950 justify-center flex-row">
      <SafeAreaView className="flex-1 px-6 justify-between py-8 max-w-lg w-full">
        {/* Cabeçalho */}
        <View className="pt-10 gap-2">
          <Text className="text-3xl font-extrabold text-white text-center">
            OmniCaixa
          </Text>
          <Text className="text-base text-blue-100 text-center">
            Acede à tua conta para gerir o negócio
          </Text>
        </View>

        {/* Formulário de Login */}
        <View className="gap-4 w-full">
          <View className="gap-1.5">
            <Text className="text-sm font-semibold text-blue-100 ml-1">
              E-mail
            </Text>
            <TextInput
              className="w-full bg-white/10 dark:bg-zinc-900 border border-blue-400/30 px-4 py-4 rounded-xl text-white placeholder:text-blue-200/50 text-base"
              placeholder="exemplo@omnicaixa.com"
              placeholderTextColor="#93c5fd80"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-sm font-semibold text-blue-100 ml-1">
              Palavra-passe
            </Text>
            <TextInput
              className="w-full bg-white/10 dark:bg-zinc-900 border border-blue-400/30 px-4 py-4 rounded-xl text-white placeholder:text-blue-200/50 text-base"
              placeholder="********"
              placeholderTextColor="#93c5fd80"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            className="w-full bg-white dark:bg-zinc-900 py-4 rounded-xl items-center active:opacity-90 shadow-sm mt-4"
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-blue-600 dark:text-white font-semibold text-base">
              {loading ? 'A entrar...' : 'Entrar na Conta'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rodapé / Voltar */}
        <View className="items-center pb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-sm text-blue-200 font-medium">
              ← Voltar ao início
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}