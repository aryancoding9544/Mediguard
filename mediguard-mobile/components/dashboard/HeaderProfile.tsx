import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { USER_PROFILE } from '../../constants/MockData';

export const HeaderProfile: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Feather name="user" size={22} color={Colors.cardWhite} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{USER_PROFILE.name}</Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={13} color={Colors.textSecondary} />
            <Text style={styles.location}>{USER_PROFILE.location}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
        <Feather name="bell" size={22} color={Colors.textPrimary} />
        <View style={styles.notificationDot} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    gap: 3,
  },
  name: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
  },
  bellButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.cardWhite,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  notificationDot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Colors.alertRed,
    borderWidth: 1.5,
    borderColor: Colors.cardWhite,
  },
});
