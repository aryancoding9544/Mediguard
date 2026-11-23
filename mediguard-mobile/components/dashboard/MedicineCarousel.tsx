import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { MEDICINES } from '../../constants/MockData';

const CARD_WIDTH = Dimensions.get('window').width * 0.65;

export const MedicineCarousel: React.FC = () => {
  const router = useRouter();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      snapToInterval={CARD_WIDTH + 18}
      decelerationRate="fast"
    >
      {MEDICINES.map((medicine) => (
        <TouchableOpacity
          key={medicine.id}
          style={[styles.card, { backgroundColor: medicine.bgColor }]}
          activeOpacity={0.9}
          onPress={() => router.push(`/product/${medicine.id}`)}
        >
          {/* Favorite button */}
          <TouchableOpacity style={styles.favoriteButton} activeOpacity={0.7}>
            <Feather name="heart" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Product image placeholder */}
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageEmoji}>{medicine.imageEmoji}</Text>
          </View>

          {/* Bottom info */}
          <View style={styles.infoRow}>
            <View style={styles.textInfo}>
              <Text style={styles.medicineName} numberOfLines={1}>
                {medicine.name}
              </Text>
              <Text style={styles.price}>{medicine.priceFormatted}</Text>
            </View>
            <TouchableOpacity style={styles.cartButton} activeOpacity={0.8}>
              <Feather name="shopping-bag" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingLeft: 22,
    paddingRight: 22,
    gap: 18,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 30,
    padding: 20,
    minHeight: 260,
    justifyContent: 'space-between',
  },
  favoriteButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  imageEmoji: {
    fontSize: 72,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInfo: {
    flex: 1,
    gap: 6,
  },
  medicineName: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
  },
  price: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.textPrimary,
  },
  cartButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.tealAccent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.tealDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
});
