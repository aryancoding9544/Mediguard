import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Caveat_400Regular, Caveat_700Bold } from '@expo-google-fonts/caveat';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Caveat_400Regular,
    Caveat_700Bold,
  });

  useEffect(() => {
    async function hideSystemNavBar() {
      if (Platform.OS === 'android') {
        try {
          // Immersive mode: Hides Android back/home/recent buttons on app launch
          await NavigationBar.setVisibilityAsync('hidden');
          if ('setBehaviorAsync' in NavigationBar) {
            await (NavigationBar as any).setBehaviorAsync('overlay-swipe');
          }
        } catch (error) {
          // Fallback or ignore if not supported in certain web/emulator environments
        }
      }
    }
    hideSystemNavBar();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.tealAccent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="scan/index"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="verify/index"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="verify/result"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="scan/result"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="product/[id]"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.canvas,
  },
});
