import { useRouter, useSegments, Stack as ExpoStack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useEffect } from 'react';
// Removed ExpoStack duplicate import

// Root Layout uses a sub-component to consume Context properly
function LayoutNavigation() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth' || segments[0] === 'onboarding';

    if (!user && !inAuthGroup) {
      // Redirect to onboarding/auth if not logged in
      router.replace('/onboarding' as any);
    } else if (user && inAuthGroup) {
      // Redirect to root if logged in and trying to access auth screens
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return (
    <>
      <StatusBar style="dark" />
      <ExpoStack screenOptions={{ headerShown: false }}>
        <ExpoStack.Screen name="onboarding/index" options={{ headerShown: false }} />
        <ExpoStack.Screen name="auth/index" options={{ headerShown: false }} />
        <ExpoStack.Screen name="(tabs)" options={{ headerShown: false }} />
      </ExpoStack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LayoutNavigation />
    </AuthProvider>
  );
}
