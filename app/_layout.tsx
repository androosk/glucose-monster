import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import Toast, { BaseToast, ToastConfig } from 'react-native-toast-message';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const toastConfig: ToastConfig = {
  success: (props) => (
    <View style={toastStyles.container}>
      <Image
        source={require('@/assets/images/mascot.png')}
        style={toastStyles.mascot}
        resizeMode="contain"
      />
      <View style={toastStyles.textContainer}>
        <Text style={toastStyles.title}>{props.text1}</Text>
        {props.text2 && <Text style={toastStyles.message}>{props.text2}</Text>}
      </View>
    </View>
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#EF4444', backgroundColor: '#1F2937' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: '600', color: '#F9FAFB' }}
      text2Style={{ fontSize: 14, color: '#9CA3AF' }}
    />
  ),
};

const toastStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mascot: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  message: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function useProtectedRoute() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  useProtectedRoute();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="edit/[id]" options={{ presentation: 'modal' }} />
      </Stack>
      <Toast config={toastConfig} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
