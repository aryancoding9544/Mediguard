import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { MEDICINES } from '../../constants/MockData';
import { QuantityStepper } from '../../components/product/QuantityStepper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GALLERY_WIDTH = SCREEN_WIDTH - 40;

export default function ProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quantity, setQuantity] = useState(2);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const medicine = MEDICINES.find((m) => m.id === id) || MEDICINES[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Feather
              name="chevron-left"
              size={24}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hera</Text>
          <TouchableOpacity style={styles.circleButton} activeOpacity={0.7}>
            <Feather name="heart" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Product Gallery */}
        <View style={styles.galleryContainer}>
          {/* Side peek cards */}
          <View
            style={[
              styles.peekCard,
              styles.leftPeek,
              { backgroundColor: Colors.mintBg },
            ]}
          />
          <View
            style={[
              styles.peekCard,
              styles.rightPeek,
              { backgroundColor: Colors.cyanLight },
            ]}
          />

          {/* Main product card */}
          <View
            style={[styles.mainCard, { backgroundColor: medicine.bgColor }]}
          >
            <Text style={styles.productEmoji}>{medicine.imageEmoji}</Text>
          </View>
        </View>

        {/* Product Title & Dosage Badge */}
        <View style={styles.titleRow}>
          <View style={styles.titleTextContainer}>
            <Text style={styles.productTitle}>
              {medicine.name.split(' ')[0]}
            </Text>
            <Text style={styles.productTitle}>
              {medicine.name.split(' ').slice(1).join(' ')}
            </Text>
          </View>
          <Text style={styles.dosageBadge}>{medicine.dosageCount}</Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text
            style={styles.description}
            numberOfLines={showFullDescription ? undefined : 3}
          >
            {medicine.description}
          </Text>
          {!showFullDescription && (
            <TouchableOpacity onPress={() => setShowFullDescription(true)}>
              <Text style={styles.moreLink}>...more</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Price & Quantity */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ${(medicine.price * quantity).toFixed(2)}
          </Text>
          <QuantityStepper
            quantity={quantity}
            onIncrement={() => setQuantity((q) => q + 1)}
            onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
          />
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
          <Feather name="shopping-bag" size={20} color="#FFFFFF" />
          <Text style={styles.ctaText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  circleButton: {
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
  headerTitle: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
  },
  galleryContainer: {
    marginHorizontal: 20,
    height: 300,
    marginBottom: 28,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCard: {
    width: GALLERY_WIDTH * 0.78,
    height: 280,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 8,
  },
  peekCard: {
    position: 'absolute',
    width: GALLERY_WIDTH * 0.65,
    height: 250,
    borderRadius: 30,
    zIndex: 1,
  },
  leftPeek: {
    left: 0,
    top: 15,
    opacity: 0.75,
  },
  rightPeek: {
    right: 0,
    top: 15,
    opacity: 0.75,
  },
  productEmoji: {
    fontSize: 92,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  titleTextContainer: {
    flex: 1,
    gap: 2,
  },
  productTitle: {
    fontSize: 30,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.textPrimary,
    lineHeight: 36,
  },
  dosageBadge: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.textSecondary,
    marginTop: 6,
  },
  descriptionContainer: {
    paddingHorizontal: 22,
    marginBottom: 24,
  },
  description: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  moreLink: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 24,
  },
  price: {
    fontSize: 30,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.textPrimary,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    paddingBottom: 38,
    paddingTop: 14,
    backgroundColor: Colors.canvas,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.charcoal,
    paddingVertical: 20,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaText: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#FFFFFF',
  },
});
