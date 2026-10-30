import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();

  // Aqui podes futuramente ligar ao teu estado de autenticação (Context API, Zustand, AsyncStorage, etc.)
  const isAuthenticated = false; 

  const handleWordPress = () => {
    if (isAuthenticated) {
      // Redireciona para o PDV dentro do grupo protegido (dashboard)
      router.push('/(dashboard)/pdv'); 
    } else {
      // Redireciona para o login dentro do grupo de autenticação
      router.push('/(auth)/login'); 
    }
  };

  return (
    <View className="flex-1 bg-blue-600 dark:bg-blue-950 justify-center flex-row">
      <SafeAreaView className="flex-1 px-6 items-center justify-between py-8 max-w-lg w-full">
        {/* Secção Hero / Cabeçalho */}
        <View className="flex-1 items-center justify-center gap-4">
          {/* Logótipo */}
          <Image 
            source={require('@/assets/images/logo.png')} 
            className="w-28 h-28 object-contain"
            resizeMode="contain"
          />

          <View className="items-center gap-1">
            <Text className="text-3xl font-extrabold text-white text-center">
              OmniCaixa
            </Text>
            <Text className="text-base text-blue-100 text-center">
              Gestão inteligente na palma da tua mão
            </Text>
          </View>
        </View>

        {/* Botão de Ação (Entrar / Começar) */}
        <View className="w-full pb-4">
          <TouchableOpacity 
            className="w-full bg-white dark:bg-zinc-900 py-4 rounded-xl items-center active:opacity-90 shadow-sm"
            onPress={handleWordPress}
          >
            <Text className="text-blue-600 dark:text-white font-semibold text-base">
              Entrar
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}