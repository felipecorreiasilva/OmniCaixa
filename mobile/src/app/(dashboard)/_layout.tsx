import { Header } from '@/components/Header';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardLayout() {
  return (
    // SafeAreaView garante que o header não fica sob a câmara/notch do telemóvel
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top', 'left', 'right']}>
      
      {/* Header fixo no topo do dashboard */}
      <Header />

      {/* Stack que gere as sub-rotas protegidas (pdv, produtos, etc.) */}
      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="pdv/index" />
          {/* Podes adicionar outras telas do dashboard aqui à medida que fores criando */}
        </Stack>
      </View>

    </SafeAreaView>
  );
}