import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  return (
    <View className="flex-1 bg-white dark:bg-zinc-950 justify-center items-center">
      <SafeAreaView className="flex-1 justify-center items-center px-6">
        <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Explorar OmniCaixa
        </Text>
      </SafeAreaView>
    </View>
  );
}