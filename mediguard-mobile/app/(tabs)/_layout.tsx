import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Generous padding for breathing room and device edge safety
  const bottomPadding = Math.max(insets.bottom + 12, 28);
  const tabHeight = 68 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabHeight,
            paddingBottom: bottomPadding,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarActiveTintColor: Colors.charcoal,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <Feather name="clock" size={24} color={String(color)} />
          ),
        }}
      />

      {/* Middle Tab: Pop-up Circle Scan Button */}
      <Tabs.Screen
        name="scan-tab"
        options={{
          title: '',
          tabBarButton: () => (
            <View style={styles.scanButtonWrapper}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  router.push('/scan');
                }}
                style={styles.scanCircle}
              >
                <Ionicons name="scan-outline" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI Chat',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color={String(color)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={String(color)} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 10,
  },
  tabBarItem: {
    paddingTop: 2,
  },
  tabBarLabel: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginTop: 4,
  },
  scanButtonWrapper: {
    top: -30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  scanCircle: {
    backgroundColor: Colors.charcoal,
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 16,
  },
});

