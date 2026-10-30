import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950 justify-center flex-row">
      <SafeAreaView className="flex-1 px-6 items-center justify-between py-8 max-w-lg w-full">
        {/* Secção Hero / Cabeçalho */}
        <View className="flex-1 items-center justify-center gap-2">
          <Text className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 text-center">
            OmniCaixa
          </Text>
          <Text className="text-base text-zinc-600 dark:text-zinc-400 text-center">
            Gestão inteligente na palma da tua mão
          </Text>
        </View>

        {/* Botão de Ação */}
        <View className="w-full pb-4">
          <TouchableOpacity 
            className="w-full bg-blue-600 dark:bg-blue-500 py-4 rounded-xl items-center active:opacity-90 shadow-sm"
            onPress={() => router.push('/(tabs)/explore')}
          >
            <Text className="text-white font-semibold text-base">
              Aceder à Aplicação
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}