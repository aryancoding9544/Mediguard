import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useVerifyStore } from '../../store/useVerifyStore';

export default function VerificationResultScreen() {
  const router = useRouter();
  const { verificationResult } = useVerifyStore();

  const handleShare = async () => {
    try {
      if (!verificationResult) return;
      const shareMessage = `MediGuard Dual Verification Audit\nStatus: ${verificationResult.status}\n${verificationResult.summary}\nProduct: ${verificationResult.packaging_info.brand_name} (${verificationResult.packaging_info.generic_name_or_composition})\nBatch: ${verificationResult.packaging_info.batch_number} | Expiry: ${verificationResult.packaging_info.expiry_date}`;
      await Share.share({ message: shareMessage });
    } catch (e) {}
  };

  if (!verificationResult) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Feather name="chevron-left" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verification Audit</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="shield-alert-outline"
            size={52}
            color={Colors.textMuted}
          />
          <Text style={styles.emptyTitle}>No Verification Performed</Text>
          <Text style={styles.emptySubtitle}>
            Please upload your prescription and medicine photos to see the safety comparison.
          </Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/verify')}
          >
            <Text style={styles.actionBtnText}>Go to Verification</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { status, summary, packaging_info, comparison_items, safety_alerts, guidance, confidence_score } =
    verificationResult;

  const isExactMatch = status === 'MATCH';
  const isPartial = status === 'PARTIAL_MATCH';
  const isMismatch = status === 'MISMATCH';

  const statusColor = isExactMatch
    ? Colors.successGreen
    : isPartial
    ? Colors.warningAmber
    : Colors.alertRed;

  const statusBg = isExactMatch
    ? '#ECFDF5'
    : isPartial
    ? '#FFFBEB'
    : '#FEF2F2';

  const statusBorder = isExactMatch
    ? '#A7F3D0'
    : isPartial
    ? '#FDE68A'
    : '#FECACA';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Feather name="chevron-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Results</Text>
        <TouchableOpacity
          style={styles.circleButton}
          activeOpacity={0.7}
          onPress={handleShare}
        >
          <Feather name="share-2" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Verification Status Header Card */}
        <View style={[styles.statusCard, { backgroundColor: statusBg, borderColor: statusBorder }]}>
          <View style={styles.statusHeaderRow}>
            <View style={[styles.statusIconCircle, { backgroundColor: statusColor }]}>
              <MaterialCommunityIcons
                name={isExactMatch ? 'shield-check' : isPartial ? 'shield-alert' : 'shield-remove'}
                size={28}
                color="#FFFFFF"
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.statusPill}>
                <Text style={[styles.statusPillText, { color: statusColor }]}>
                  {status === 'MATCH'
                    ? 'VERIFIED MATCH'
                    : status === 'PARTIAL_MATCH'
                    ? 'GENERIC / PARTIAL MATCH'
                    : 'POTENTIAL MISMATCH'}
                </Text>
              </View>
              <Text style={styles.summaryTitle}>{summary}</Text>
            </View>
          </View>

          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>Confidence Score:</Text>
            <Text style={styles.confidenceValue}>
              {Math.round(confidence_score * 100)}%
            </Text>
          </View>
        </View>

        {/* FEATURE 2: DETAILED PRESCRIPTION VS PURCHASED MEDICINE COMPARISON */}
        <View style={styles.sectionTitleRow}>
          <MaterialCommunityIcons name="compare-horizontal" size={22} color={Colors.tealDark} />
          <Text style={styles.sectionHeaderTitle}>Prescription vs. Purchased Match</Text>
        </View>

        {comparison_items && comparison_items.length > 0 ? (
          comparison_items.map((item, idx) => {
            const itemMatch = item.is_exact_match;
            const itemGeneric = item.is_generic_equivalent;
            const itemMismatch = item.is_mismatch;

            return (
              <View key={idx} style={styles.comparisonCard}>
                <View style={styles.compHeader}>
                  <Text style={styles.itemIndex}>Item #{idx + 1}</Text>
                  <View
                    style={[
                      styles.matchBadge,
                      {
                        backgroundColor: itemMatch
                          ? '#ECFDF5'
                          : itemGeneric
                          ? '#EFF6FF'
                          : '#FEF2F2',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.matchBadgeText,
                        {
                          color: itemMatch
                            ? Colors.successGreen
                            : itemGeneric
                            ? '#2563EB'
                            : Colors.alertRed,
                        },
                      ]}
                    >
                      {itemMatch
                        ? 'EXACT MATCH'
                        : itemGeneric
                        ? 'GENERIC EQUIVALENT'
                        : 'MISMATCH / CAUTION'}
                    </Text>
                  </View>
                </View>

                {/* Prescribed vs Purchased Side-by-Side comparison */}
                <View style={styles.comparisonGrid}>
                  <View style={styles.compareCol}>
                    <Text style={styles.compareColLabel}>Doctor Prescribed</Text>
                    <Text style={styles.medNameText}>{item.prescribed_name}</Text>
                    {item.prescribed_dosage ? (
                      <Text style={styles.medDosageText}>{item.prescribed_dosage}</Text>
                    ) : null}
                  </View>

                  <View style={styles.arrowBetween}>
                    <Ionicons name="arrow-forward" size={18} color={Colors.textMuted} />
                  </View>

                  <View style={styles.compareCol}>
                    <Text style={styles.compareColLabel}>Purchased Medicine</Text>
                    <Text style={styles.medNameText}>{item.purchased_product_name}</Text>
                    {item.purchased_composition ? (
                      <Text style={styles.medDosageText}>{item.purchased_composition}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Match criteria tags */}
                <View style={styles.criteriaRow}>
                  <View style={styles.criteriaPill}>
                    <Ionicons
                      name={item.strength_match !== false ? 'checkmark-circle' : 'close-circle'}
                      size={15}
                      color={item.strength_match !== false ? Colors.successGreen : Colors.alertRed}
                    />
                    <Text style={styles.criteriaText}>
                      Strength {item.strength_match !== false ? 'Matches' : 'Different'}
                    </Text>
                  </View>

                  <View style={styles.criteriaPill}>
                    <Ionicons
                      name={item.dosage_form_match !== false ? 'checkmark-circle' : 'alert-circle'}
                      size={15}
                      color={item.dosage_form_match !== false ? Colors.successGreen : Colors.warningAmber}
                    />
                    <Text style={styles.criteriaText}>
                      Form {item.dosage_form_match !== false ? 'Compatible' : 'Different'}
                    </Text>
                  </View>
                </View>

                {/* Clinical Explanation */}
                {item.explanation ? (
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationText}>
                      <Text style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>Evaluation: </Text>
                      {item.explanation}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })
        ) : (
          <View style={styles.comparisonCard}>
            <Text style={styles.medDosageText}>No specific comparison item returned.</Text>
          </View>
        )}

        {/* FEATURE 1: MEDICINE PACKAGING & AUTHENTICITY AUDIT (Back Side Info) */}
        <View style={[styles.sectionTitleRow, { marginTop: 20 }]}>
          <MaterialCommunityIcons name="cube-scan" size={22} color={Colors.tealDark} />
          <Text style={styles.sectionHeaderTitle}>Packaging & Authenticity Details</Text>
        </View>

        <View style={styles.packagingCard}>
          <View style={styles.pkgRow}>
            <Text style={styles.pkgLabel}>Manufacturer:</Text>
            <Text style={styles.pkgValue}>{packaging_info.manufacturer || 'Not visible'}</Text>
          </View>
          <View style={styles.pkgRow}>
            <Text style={styles.pkgLabel}>Active Salt / Composition:</Text>
            <Text style={styles.pkgValue}>{packaging_info.generic_name_or_composition || 'Visible on strip'}</Text>
          </View>
          <View style={styles.pkgRow}>
            <Text style={styles.pkgLabel}>Batch / Lot No:</Text>
            <Text style={[styles.pkgValue, styles.monoText]}>{packaging_info.batch_number || 'Detected'}</Text>
          </View>
          <View style={styles.pkgRow}>
            <Text style={styles.pkgLabel}>Expiry Date:</Text>
            <Text
              style={[
                styles.pkgValue,
                packaging_info.is_expired ? { color: Colors.alertRed, fontFamily: 'PlusJakartaSans_700Bold' } : {},
              ]}
            >
              {packaging_info.expiry_date || 'N/A'}{' '}
              {packaging_info.is_expired ? '(EXPIRED!)' : ''}
            </Text>
          </View>
          {packaging_info.mfg_date && packaging_info.mfg_date !== 'Not visible' ? (
            <View style={styles.pkgRow}>
              <Text style={styles.pkgLabel}>Mfg Date:</Text>
              <Text style={styles.pkgValue}>{packaging_info.mfg_date}</Text>
            </View>
          ) : null}

          {/* Barcode / QR Codes detected */}
          {packaging_info.detected_codes && packaging_info.detected_codes.length > 0 && (
            <View style={styles.codeTagsContainer}>
              <Text style={styles.subtleHeading}>Packaging Marks / Codes:</Text>
              <View style={styles.tagsWrap}>
                {packaging_info.detected_codes.map((c, i) => (
                  <View key={i} style={styles.codePill}>
                    <Feather name="maximize" size={12} color={Colors.tealDark} />
                    <Text style={styles.codePillText}>{c}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Authenticity Indicators */}
          {packaging_info.authenticity_indicators && packaging_info.authenticity_indicators.length > 0 && (
            <View style={styles.authIndicatorsContainer}>
              <Text style={styles.subtleHeading}>Authenticity Verification Markers:</Text>
              {packaging_info.authenticity_indicators.map((ind, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Ionicons name="checkmark-circle" size={15} color={Colors.tealDark} />
                  <Text style={styles.bulletText}>{ind}</Text>
                </View>
              ))}
            </View>
          )}

          {packaging_info.authenticity_notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{packaging_info.authenticity_notes}</Text>
            </View>
          ) : null}
        </View>

        {/* Safety Alerts / Warning Callouts */}
        {safety_alerts && safety_alerts.length > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Feather name="alert-triangle" size={18} color={Colors.alertRed} />
              <Text style={styles.alertTitle}>Safety Warnings</Text>
            </View>
            {safety_alerts.map((alert, i) => (
              <Text key={i} style={styles.alertText}>
                • {alert}
              </Text>
            ))}
          </View>
        )}

        {/* Guidance / Patient Advice */}
        {guidance ? (
          <View style={styles.guidanceBox}>
            <Text style={styles.guidanceTitle}>Pharmacist Guidance</Text>
            <Text style={styles.guidanceText}>{guidance}</Text>
          </View>
        ) : null}

        {/* Action button */}
        <TouchableOpacity
          style={styles.bottomActionButton}
          onPress={() => router.push('/verify')}
          activeOpacity={0.8}
        >
          <Feather name="rotate-cw" size={18} color="#FFFFFF" />
          <Text style={styles.bottomActionButtonText}>Verify Another Medicine</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.cardWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  actionBtn: {
    backgroundColor: Colors.charcoal,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  statusCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    marginBottom: 22,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  statusIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  statusPillText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: 0.5,
  },
  summaryTitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    gap: 6,
  },
  confidenceLabel: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
  },
  confidenceValue: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
  },
  comparisonCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 14,
  },
  compHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIndex: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textSecondary,
  },
  matchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  matchBadgeText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  comparisonGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  compareCol: {
    flex: 1,
  },
  compareColLabel: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.textSecondary,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  medNameText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
  },
  medDosageText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.tealDark,
    marginTop: 2,
  },
  arrowBetween: {
    paddingHorizontal: 8,
  },
  criteriaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  criteriaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  criteriaText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.textPrimary,
  },
  explanationBox: {
    backgroundColor: '#F0FDFA',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.tealDark,
  },
  explanationText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  packagingCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 18,
  },
  pkgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pkgLabel: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
  },
  pkgValue: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.textPrimary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  monoText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.tealDark,
  },
  codeTagsContainer: {
    marginTop: 12,
    paddingTop: 10,
  },
  subtleHeading: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  codePillText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.tealDark,
  },
  authIndicatorsContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 3,
  },
  bulletText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textPrimary,
  },
  notesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  notesText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  alertCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.alertRed,
  },
  alertText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#991B1B',
    lineHeight: 18,
    marginBottom: 4,
  },
  guidanceBox: {
    backgroundColor: Colors.cardWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 20,
  },
  guidanceTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  guidanceText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bottomActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.charcoal,
    borderRadius: 18,
    paddingVertical: 16,
    marginBottom: 20,
  },
  bottomActionButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
