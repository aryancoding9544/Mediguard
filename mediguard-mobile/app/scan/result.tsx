import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useScanStore } from '../../store/useScanStore';

export default function ScanResultScreen() {
  const router = useRouter();
  const { analysisResult, capturedImageUri } = useScanStore();
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const handleShare = async () => {
    try {
      const firstMed = analysisResult?.identified_medicines?.[0];
      const message = analysisResult
        ? `MediGuard Prescription Analysis\nPatient Concern: ${analysisResult.patient_concern}\nMedicine: ${firstMed?.name || 'Identified'}\nDosage: ${firstMed?.dosage || 'As prescribed'}`
        : 'MediGuard Prescription Analysis';
      await Share.share({ message });
    } catch (e) {}
  };

  // If no result is loaded yet (e.g. direct nav without scanning)
  if (!analysisResult) {
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
          <Text style={styles.headerTitle}>Prescription Analysis</Text>
          <View style={{ width: 46 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Feather name="file-text" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Prescription Analyzed Yet</Text>
          <Text style={styles.emptySubtitle}>
            Please scan or upload a prescription image to view the AI analysis.
          </Text>
          <TouchableOpacity
            style={styles.scanNowButton}
            onPress={() => router.push('/scan')}
          >
            <Text style={styles.scanNowButtonText}>Scan Prescription</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const confidencePercent = Math.round(
    (analysisResult.confidence_score || 0.9) * 100
  );
  const primaryMed = analysisResult.identified_medicines?.[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Feather name="chevron-left" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prescription Analysis</Text>
          <TouchableOpacity
            style={styles.circleButton}
            activeOpacity={0.7}
            onPress={handleShare}
          >
            <Feather name="share-2" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Confidence Banner */}
        <View
          style={[
            styles.confidenceBanner,
            confidencePercent < 70 && {
              backgroundColor: '#FEF2F2',
              borderColor: '#FECACA',
            },
          ]}
        >
          <View style={styles.confidenceIconCircle}>
            <Ionicons
              name={
                confidencePercent >= 70
                  ? 'checkmark-circle'
                  : 'alert-circle'
              }
              size={28}
              color={
                confidencePercent >= 70
                  ? Colors.successGreen
                  : Colors.warningAmber
              }
            />
          </View>
          <View style={styles.confidenceTextContainer}>
            <View style={styles.confidenceRow}>
              <Text style={styles.confidenceTitle}>
                {confidencePercent >= 70
                  ? 'OCR Analysis Verified'
                  : 'Low Confidence Warning'}
              </Text>
              <View
                style={[
                  styles.badgePill,
                  confidencePercent < 70 && {
                    backgroundColor: Colors.warningAmber,
                  },
                ]}
              >
                <Text style={styles.badgePillText}>{confidencePercent}% CONFIDENCE</Text>
              </View>
            </View>
            <Text style={styles.confidenceSubtitle}>
              {confidencePercent >= 70
                ? 'Handwriting decoded & cross-referenced with Medicine Registry'
                : 'Handwriting was partly unreadable. Please double check with a pharmacist.'}
            </Text>
          </View>
        </View>

        {/* Prescription Image Preview Card */}
        {capturedImageUri && (
          <View style={styles.imageCard}>
            <View style={styles.imageCardHeader}>
              <View style={styles.cardHeaderRowNoMargin}>
                <View style={styles.cardIconBox}>
                  <Feather name="image" size={18} color={Colors.charcoal} />
                </View>
                <Text style={styles.cardSectionTitle}>Prescription Image</Text>
              </View>
              <TouchableOpacity
                style={styles.expandBadge}
                activeOpacity={0.7}
                onPress={() => setImageModalVisible(true)}
              >
                <Feather name="maximize-2" size={13} color={Colors.tealDark} />
                <Text style={styles.expandBadgeText}>Enlarge</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setImageModalVisible(true)}
              style={styles.imageWrapper}
            >
              <Image
                source={{ uri: capturedImageUri }}
                style={styles.prescriptionImagePreview}
                resizeMode="cover"
              />
              <View style={styles.imageOverlayHint}>
                <Feather name="zoom-in" size={14} color="#FFF" />
                <Text style={styles.imageOverlayHintText}>Tap to inspect full photo</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Full Image Modal */}
        <Modal
          visible={imageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <SafeAreaView style={styles.modalSafeContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Prescription Photo</Text>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setImageModalVisible(false)}
                >
                  <Feather name="x" size={22} color="#FFF" />
                </TouchableOpacity>
              </View>
              {capturedImageUri && (
                <Image
                  source={{ uri: capturedImageUri }}
                  style={styles.modalFullImage}
                  resizeMode="contain"
                />
              )}
            </SafeAreaView>
          </View>
        </Modal>

        {/* Doctor Prescription Extraction Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconBox}>
              <Feather name="file-text" size={18} color={Colors.charcoal} />
            </View>
            <Text style={styles.cardSectionTitle}>Extracted Doctor's Order</Text>
          </View>

          <View style={styles.prescriptionPreviewBox}>
            <Text style={styles.prescriptionLabel}>PATIENT CONCERN / DIAGNOSIS</Text>
            <Text style={styles.concernText}>
              {analysisResult.patient_concern || 'Not specified on prescription'}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.prescriptionLabel}>IDENTIFIED MEDICINES</Text>
            {analysisResult.identified_medicines &&
            analysisResult.identified_medicines.length > 0 ? (
              analysisResult.identified_medicines.map((med, idx) => (
                <View key={idx} style={styles.recommendationHighlight}>
                  <Text style={styles.identifiedMedName}>{med.name}</Text>
                  <Text style={styles.identifiedDosage}>
                    {med.dosage || 'Dosage not clearly specified'}
                  </Text>
                  {med.generic_name ? (
                    <Text style={styles.genericSubtext}>
                      Generic: {med.generic_name}
                    </Text>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={styles.noMedText}>
                No specific medicines could be recognized with certainty.
              </Text>
            )}

            {/* Uncertain handwriting segments flagged by Gemini */}
            {analysisResult.uncertain_segments &&
              analysisResult.uncertain_segments.length > 0 && (
                <View style={styles.uncertainBox}>
                  <Text style={styles.uncertainTitle}>
                    Unreadable / Uncertain Segments:
                  </Text>
                  {analysisResult.uncertain_segments.map((seg, i) => (
                    <Text key={i} style={styles.uncertainItem}>
                      • "{seg}"
                    </Text>
                  ))}
                </View>
              )}
          </View>
        </View>

        {/* Pharmacological Profile Card */}
        {primaryMed && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardIconBox, { backgroundColor: Colors.mintBg }]}>
                <Ionicons name="medical" size={18} color={Colors.tealDark} />
              </View>
              <Text style={styles.cardSectionTitle}>Pharmacological Profile</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Active Ingredient</Text>
              <Text style={styles.detailValue}>
                {primaryMed.generic_name || 'N/A'}
              </Text>
            </View>

            {primaryMed.therapeutic_class && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Therapeutic Class</Text>
                <Text style={styles.detailValue}>{primaryMed.therapeutic_class}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Primary Medical Uses</Text>
              <Text style={styles.detailValueDescription}>
                {primaryMed.primary_uses ||
                  'Used as directed by a healthcare professional.'}
              </Text>
            </View>

            {primaryMed.warnings && (
              <View style={styles.warningBox}>
                <View style={styles.warningHeader}>
                  <Feather
                    name="alert-triangle"
                    size={16}
                    color={Colors.warningAmber}
                  />
                  <Text style={styles.warningTitle}>Precautions & Safety</Text>
                </View>
                <Text style={styles.warningText}>{primaryMed.warnings}</Text>
              </View>
            )}
          </View>
        )}

        {/* Central Batch Registry & Safety Check Card */}
        {analysisResult.batch_verification && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardIconBox, { backgroundColor: '#E0FEFF' }]}>
                <Feather name="shield" size={18} color={Colors.tealDark} />
              </View>
              <Text style={styles.cardSectionTitle}>Batch Safety Registry</Text>
            </View>

            <View style={styles.registryGrid}>
              <View style={styles.registryItem}>
                <Text style={styles.registryItemLabel}>Batch Code</Text>
                <Text style={styles.registryItemValue}>
                  {analysisResult.batch_verification.batch_number || 'N/A'}
                </Text>
              </View>
              <View style={styles.registryItem}>
                <Text style={styles.registryItemLabel}>Recall Status</Text>
                <Text
                  style={[
                    styles.registryItemValue,
                    {
                      color:
                        analysisResult.batch_verification.recall_status ===
                        'CLEAR'
                          ? Colors.successGreen
                          : Colors.warningAmber,
                    },
                  ]}
                >
                  {analysisResult.batch_verification.recall_status}
                </Text>
              </View>
              <View style={styles.registryItem}>
                <Text style={styles.registryItemLabel}>Expiry Date</Text>
                <Text style={styles.registryItemValue}>
                  {analysisResult.batch_verification.expiry_date || 'N/A'}
                </Text>
              </View>
              <View style={styles.registryItem}>
                <Text style={styles.registryItemLabel}>Database</Text>
                <Text style={styles.registryItemValue}>
                  {analysisResult.batch_verification.database || 'Verified'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Feather name="refresh-cw" size={15} color={Colors.charcoal} />
          <Text style={styles.secondaryButtonText}>Scan Another Prescription</Text>
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
    paddingBottom: 110,
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
  ordersSavedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mintBg,
    borderRadius: 18,
    marginHorizontal: 22,
    marginBottom: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.tealAccent,
  },
  ordersSavedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ordersSavedTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.tealDark,
  },
  ordersSavedSubtitle: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.charcoal,
    opacity: 0.8,
  },
  viewOrdersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewOrdersBtnText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.tealDark,
  },
  imageCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: 26,
    marginHorizontal: 22,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  imageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderRowNoMargin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  expandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.mintBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  expandBadgeText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.tealDark,
  },
  imageWrapper: {
    width: '100%',
    height: 190,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  prescriptionImagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlayHint: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  imageOverlayHintText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  modalSafeContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  modalHeaderTitle: {
    color: '#FFF',
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFullImage: {
    flex: 1,
    width: '100%',
  },
  primaryBottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.charcoal,
    paddingVertical: 13,
    borderRadius: 9999,
  },
  primaryBottomButtonText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
  },
  confidenceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginHorizontal: 22,
    marginBottom: 20,
    padding: 16,
    borderRadius: 22,
    gap: 14,
  },
  confidenceIconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  confidenceTextContainer: {
    flex: 1,
    gap: 3,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confidenceTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#065F46',
  },
  badgePill: {
    backgroundColor: Colors.successGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: 0.5,
  },
  confidenceSubtitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#047857',
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.cardWhite,
    borderRadius: 26,
    marginHorizontal: 22,
    marginBottom: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSectionTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
  },
  prescriptionPreviewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  prescriptionLabel: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  concernText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  recommendationHighlight: {
    backgroundColor: Colors.mintBg,
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: Colors.tealAccent,
  },
  identifiedMedName: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.tealDark,
    marginBottom: 2,
  },
  identifiedDosage: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.charcoal,
  },
  genericSubtext: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  noMedText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  uncertainBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  uncertainTitle: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.warningAmber,
    marginBottom: 4,
  },
  uncertainItem: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  detailRow: {
    marginBottom: 14,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
  },
  detailValueDescription: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  warningBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 14,
    marginTop: 6,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  warningTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#92400E',
  },
  warningText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#78350F',
    lineHeight: 19,
  },
  registryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  registryItem: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  registryItemLabel: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  registryItemValue: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 24,
    backgroundColor: Colors.canvas,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.cardWhite,
    paddingVertical: 14,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.charcoal,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  scanNowButton: {
    backgroundColor: Colors.charcoal,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  scanNowButtonText: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
  },
});
