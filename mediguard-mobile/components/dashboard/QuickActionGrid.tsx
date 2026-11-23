import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

interface QuickAction {
  icon?: keyof typeof Feather.glyphMap;
  mIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  route?: string;
}

const ACTIONS: QuickAction[] = [
  { icon: 'camera', label: 'Scan Rx', route: '/scan' },
  { mIcon: 'shield-check', label: 'Verify Rx vs Meds', route: '/verify' },
  { icon: 'clock', label: 'History', route: '/(tabs)/orders' },
  { icon: 'map-pin', label: 'Pharmacy' },
];

export const QuickActionGrid: React.FC = () => {
  const router = useRouter();

  const handlePress = (action: QuickAction) => {
    if (action.route) {
      router.push(action.route as any);
    }
  };

  return (
    <View style={styles.container}>
      {ACTIONS.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={styles.pill}
          activeOpacity={0.7}
          onPress={() => handlePress(action)}
        >
          {action.icon && (
            <Feather name={action.icon} size={18} color={Colors.textPrimary} />
          )}
          {action.mIcon && (
            <MaterialCommunityIcons
              name={action.mIcon}
              size={19}
              color={Colors.tealDark}
            />
          )}
          <Text style={styles.label}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 22,
    paddingBottom: 26,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.cardWhite,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.textPrimary,
  },
});
