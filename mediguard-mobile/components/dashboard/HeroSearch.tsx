import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export const HeroSearch: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.lightText}>Verify Your</Text>
        <Text style={styles.boldText} numberOfLines={1} adjustsFontSizeToFit>
          Prescriptions Safely
        </Text>
      </View>
      <TouchableOpacity style={styles.searchButton} activeOpacity={0.8}>
        <Feather name="search" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 24,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
    gap: 4,
  },
  lightText: {
    fontSize: 28,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: Colors.textMuted,
    lineHeight: 34,
  },
  boldText: {
    fontSize: 30,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.textPrimary,
    lineHeight: 36,
  },
  searchButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 2,
  },
});
