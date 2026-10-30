import "../global.css";

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {/* O Stack gere os ecrãs principais da aplicação sem barra inferior fixa */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />              {/* Landing Page (Raiz) */}
        <Stack.Screen name="(auth)" />             {/* Grupo de autenticação (ex: login) */}
        <Stack.Screen name="(dashboard)" />        {/* Grupo protegido do painel (PDV, produtos, etc.) */}
      </Stack>
    </ThemeProvider>
  );
}