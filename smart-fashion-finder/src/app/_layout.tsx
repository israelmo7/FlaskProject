import '../../global.css';
import { useEffect } from 'react';
import { I18nManager, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import { he } from '@/i18n/he';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

// פיילוט ישראלי — ממשק מימין לשמאל
I18nManager.allowRTL(true);
try {
  I18nManager.forceRTL(true);
} catch {
  // web / already set
}

export default function RootLayout() {
  const [loaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <View style={{ flex: 1, direction: 'rtl' }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#F3EEE6' },
          headerTintColor: '#12161C',
          headerTitleStyle: {
            fontFamily: 'Fraunces_600SemiBold',
            fontSize: 18,
          },
          headerTitleAlign: 'center',
          contentStyle: { backgroundColor: '#F3EEE6' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="analysis"
          options={{ title: he.analysisTitle, presentation: 'card' }}
        />
        <Stack.Screen
          name="stores"
          options={{ title: he.storesTitle, presentation: 'card' }}
        />
      </Stack>
    </View>
  );
}
