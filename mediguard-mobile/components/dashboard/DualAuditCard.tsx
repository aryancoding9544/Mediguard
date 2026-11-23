import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useOrdersStore } from '../../store/useOrdersStore';

export const DualAuditCard: React.FC = () => {
  const router = useRouter();
  const { orders } = useOrdersStore();

  const recentOrder = orders && orders.length > 0 ? orders[0] : null;

  return (
    <View style={styles.container}>
      {/* ================= PRIMARY HERO BANNER: DUAL AUDIT ================= */}
      <View style={styles.heroCard}>
        {/* Top Header Row with Safety Badge */}
        <View style={styles.badgeRow}>
          <View style={styles.safetyTag}>
            <MaterialCommunityIcons name="shield-check" size={14} color="#0D9488" />
            <Text style={styles.safetyTagText}>PHARMACOVIGILANCE AUDIT</Text>
          </View>
          <View style={styles.activeDotContainer}>
            <View style={styles.pulseDot} />
            <Text style={styles.activeText}>AI Vision Active</Text>
          </View>
        </View>

        {/* Headline & Description */}
        <Text style={styles.heroTitle}>Bought Medicines from Chemist?</Text>
        <Text style={styles.heroDescription}>
          Cross-check your handwritten doctor slip against your medicine strip packaging to prevent dangerous drug mismatches, wrong strengths, or expired stock.
        </Text>

        {/* Visual Pill: Rx vs Packaging */}
        <View style={styles.previewVisualRow}>
          <View style={styles.visualThumbCard}>
            <MaterialCommunityIcons name="file-document-edit-outline" size={20} color="#0D9488" />
            <Text style={styles.visualThumbLabel}>Doctor Rx</Text>
          </View>

          <View style={styles.vsBadge}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <View style={styles.visualThumbCard}>
            <MaterialCommunityIcons name="pill" size={20} color="#7C3AED" />
            <Text style={styles.visualThumbLabel}>Medicine Strip</Text>
          </View>
        </View>

        {/* Feature Badges */}
        <View style={styles.featureGrid}>
          <View style={styles.featurePill}>
            <Feather name="check" size={13} color="#0D9488" />
            <Text style={styles.featurePillText}>Salt Bioequivalence</Text>
          </View>
          <View style={styles.featurePill}>
            <Feather name="check" size={13} color="#0D9488" />
            <Text style={styles.featurePillText}>Expiry & Batch</Text>
          </View>
          <View style={styles.featurePill}>
            <Feather name="check" size={13} color="#0D9488" />
            <Text style={styles.featurePillText}>Dosage Safety</Text>
          </View>
        </View>

        {/* Primary CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.88}
          onPress={() => router.push('/verify')}
        >
          <View style={styles.ctaButtonContent}>
            <MaterialCommunityIcons name="camera-iris" size={20} color="#FFFFFF" />
            <Text style={styles.ctaButtonText}>Start Dual Audit (Rx vs Meds)</Text>
          </View>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ================= RECENT ACTIVITY SECTION ================= */}
      {recentOrder ? (
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentSectionTitle}>Latest Safety Verification</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/orders')}
            >
              <Text style={styles.viewAllText}>View All History</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.recentOrderCard}
            activeOpacity={0.85}
            onPress={() => {
              if (recentOrder.type === 'verification') {
                router.push('/verify/result');
              } else {
                router.push('/scan/result');
              }
            }}
          >
            <View style={styles.recentCardLeft}>
              {recentOrder.imageUri ? (
                <Image
                  source={{ uri: recentOrder.imageUri }}
                  style={styles.recentThumb}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.recentThumbPlaceholder}>
                  <Feather name="file-text" size={20} color="#0D9488" />
                </View>
              )}
              <View style={styles.recentCardTextCol}>
                <View style={styles.recentTopRow}>
                  <Text style={styles.recentOrderNumber}>{recentOrder.orderNumber}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      recentOrder.status === 'MISMATCH'
                        ? styles.mismatchPill
                        : styles.matchPill,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        recentOrder.status === 'MISMATCH'
                          ? styles.mismatchPillText
                          : styles.matchPillText,
                      ]}
                    >
                      {recentOrder.status || 'VERIFIED'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.recentConcern} numberOfLines={1}>
                  {recentOrder.patientConcern ||
                    (recentOrder.type === 'verification'
                      ? 'Pharmacy Dispensing Audit'
                      : 'Prescription Decipher')}
                </Text>

                {recentOrder.medicineNames && recentOrder.medicineNames.length > 0 && (
                  <Text style={styles.recentMeds} numberOfLines={1}>
                    {recentOrder.medicineNames.join(' • ')}
                  </Text>
                )}
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.tipCard}>
          <View style={styles.tipIconBox}>
            <Ionicons name="bulb-outline" size={20} color="#D97706" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Quick Medical Tip</Text>
            <Text style={styles.tipDescription}>
              Always examine the embossed manufacturer batch and expiry date on medicine foil strips to ensure your pharmacy dispensed genuine stock.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    gap: 16,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  safetyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  safetyTagText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0D9488',
    letterSpacing: 0.5,
  },
  activeDotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  activeText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#64748B',
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: '#0F172A',
    lineHeight: 27,
    marginBottom: 6,
  },
  heroDescription: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#475569',
    marginBottom: 16,
  },
  previewVisualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  visualThumbCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visualThumbLabel: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#1E293B',
  },
  vsBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  vsText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 18,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  featurePillText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#334155',
  },
  ctaButton: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#FFFFFF',
  },
  recentSection: {
    marginTop: 4,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  recentSectionTitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#0D9488',
  },
  recentOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  recentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  recentThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  recentThumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentCardTextCol: {
    flex: 1,
    gap: 2,
  },
  recentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  recentOrderNumber: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0F172A',
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mismatchPill: {
    backgroundColor: '#FEF2F2',
  },
  matchPill: {
    backgroundColor: '#F0FDF4',
  },
  statusPillText: {
    fontSize: 9,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: 0.4,
  },
  mismatchPillText: {
    color: '#EF4444',
  },
  matchPillText: {
    color: '#16A34A',
  },
  recentConcern: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#334155',
  },
  recentMeds: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#64748B',
  },
  tipCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
    gap: 3,
  },
  tipTitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#92400E',
  },
  tipDescription: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#B45309',
  },
});
