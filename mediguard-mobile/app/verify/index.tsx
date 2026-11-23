import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useVerifyStore } from '../../store/useVerifyStore';
import { useOrdersStore } from '../../store/useOrdersStore';
import { verifyPrescriptionAndMedicines } from '../../services/api';

export default function DualVerificationScreen() {
  const router = useRouter();
  const { addVerificationOrder } = useOrdersStore();
  const {
    prescriptionImage,
    setPrescriptionImage,
    medicineImages,
    addMedicineImage,
    addMedicineImages,
    removeMedicineImage,
    clearMedicineImages,
    isVerifying,
    setIsVerifying,
    setVerificationResult,
    reset,
  } = useVerifyStore();

  // Pick single prescription image from gallery
  const pickPrescriptionImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setPrescriptionImage({
          id: `rx_${Date.now()}`,
          uri: asset.uri,
          base64: asset.base64 || null,
          name: asset.fileName || 'Prescription',
        });
      }
    } catch (e) {
      console.log('Error picking prescription image:', e);
    }
  };

  // Capture prescription image with camera
  const capturePrescriptionImage = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera access is required to photograph your prescription.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setPrescriptionImage({
          id: `rx_${Date.now()}`,
          uri: asset.uri,
          base64: asset.base64 || null,
          name: asset.fileName || 'Prescription',
        });
      }
    } catch (e) {
      console.log('Error capturing prescription:', e);
    }
  };

  // Pick multiple medicine images from gallery (supports backside, box, composition)
  const pickMedicineImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages = result.assets.map((asset, index) => ({
          id: `med_${Date.now()}_${index}`,
          uri: asset.uri,
          base64: asset.base64 || null,
          name: asset.fileName || `Medicine Photo ${medicineImages.length + index + 1}`,
        }));
        addMedicineImages(newImages);
      }
    } catch (e) {
      console.log('Error picking medicine images:', e);
    }
  };

  // Capture medicine image with camera (specifically back of strip/box)
  const captureMedicineImage = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera access is required to photograph your medicines.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        addMedicineImage({
          id: `med_${Date.now()}`,
          uri: asset.uri,
          base64: asset.base64 || null,
          name: asset.fileName || `Medicine Photo ${medicineImages.length + 1}`,
        });
      }
    } catch (e) {
      console.log('Error capturing medicine photo:', e);
    }
  };

  const handleStartVerification = async () => {
    if (!prescriptionImage) {
      Alert.alert(
        'Prescription Missing',
        'Please upload an image of your doctor prescription before verifying.'
      );
      return;
    }

    if (medicineImages.length === 0) {
      Alert.alert(
        'Medicine Images Missing',
        'Please upload at least one photo showing the back side or label of the purchased medicine.'
      );
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyPrescriptionAndMedicines(
        { uri: prescriptionImage.uri, base64: prescriptionImage.base64 },
        medicineImages.map((m) => ({ uri: m.uri, base64: m.base64 }))
      );

      setVerificationResult(result);

      // Store in orders locally with both prescription and medicine packaging images
      try {
        await addVerificationOrder({
          prescriptionImageUri: prescriptionImage.uri,
          prescriptionImageBase64: prescriptionImage.base64,
          medicineImages: medicineImages.map((m) => ({
            uri: m.uri,
            base64: m.base64,
            name: m.name,
          })),
          result,
        });
      } catch (saveErr) {
        console.warn('[DualVerificationScreen] Error saving local order:', saveErr);
      }

      setIsVerifying(false);
      router.push('/verify/result');
    } catch (err: any) {
      setIsVerifying(false);
      console.error('Verification failed:', err);
      Alert.alert(
        'Verification Audit Failed',
        err.message || 'Could not verify prescription and medicines. Please try again with clearer photos.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Dual Verification</Text>
          <Text style={styles.headerSubtitle}>Cross-check Rx with Medicines</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            reset();
          }}
          style={styles.resetButton}
          activeOpacity={0.7}
        >
          <Feather name="rotate-ccw" size={19} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIconWrapper}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={24}
              color={Colors.tealDark}
            />
          </View>
          <View style={styles.infoTextWrapper}>
            <Text style={styles.infoTitle}>Safety & Verification Dual Check</Text>
            <Text style={styles.infoDesc}>
              1. Inspects the <Text style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>back side of your medicine</Text> for batch, expiry, manufacturer, & authenticity.
              {'\n'}
              2. Compares prescribed drugs against purchased items to protect you from dispensing errors.
            </Text>
          </View>
        </View>

        {/* SECTION 1: PRESCRIPTION (Single Image) */}
        <View style={styles.sectionHeader}>
          <View style={styles.badgeNumber}>
            <Text style={styles.badgeNumberText}>1</Text>
          </View>
          <View>
            <Text style={styles.sectionTitle}>Doctor's Prescription</Text>
            <Text style={styles.sectionSubtitle}>1 clear photo of written Rx</Text>
          </View>
          {prescriptionImage && (
            <View style={styles.readyTag}>
              <Feather name="check" size={13} color={Colors.successGreen} />
              <Text style={styles.readyTagText}>Ready</Text>
            </View>
          )}
        </View>

        {prescriptionImage ? (
          <View style={styles.prescriptionCard}>
            <Image
              source={{ uri: prescriptionImage.uri }}
              style={styles.prescriptionPreview}
              resizeMode="cover"
            />
            <View style={styles.prescriptionCardOverlay}>
              <View style={styles.imageBadge}>
                <Ionicons name="document-text" size={14} color="#FFF" />
                <Text style={styles.imageBadgeText}>Prescription</Text>
              </View>
              <View style={styles.actionRowOverlay}>
                <TouchableOpacity
                  style={styles.overlayActionBtn}
                  onPress={pickPrescriptionImage}
                >
                  <Feather name="refresh-cw" size={16} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.overlayActionBtn, styles.overlayActionBtnDanger]}
                  onPress={() => setPrescriptionImage(null)}
                >
                  <Feather name="trash-2" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyUploadBox}>
            <MaterialCommunityIcons
              name="file-document-edit-outline"
              size={42}
              color={Colors.textMuted}
            />
            <Text style={styles.uploadBoxTitle}>Upload Doctor's Prescription</Text>
            <Text style={styles.uploadBoxSub}>
              Ensure handwriting, drug names, and instructions are clearly visible
            </Text>
            <View style={styles.uploadActionButtons}>
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={capturePrescriptionImage}
                activeOpacity={0.8}
              >
                <Feather name="camera" size={16} color={Colors.charcoal} />
                <Text style={styles.uploadBtnText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={pickPrescriptionImage}
                activeOpacity={0.8}
              >
                <Feather name="image" size={16} color={Colors.charcoal} />
                <Text style={styles.uploadBtnText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.divider} />

        {/* SECTION 2: MEDICINES (Multiple Images - Front, Back, QR, Batch) */}
        <View style={styles.sectionHeader}>
          <View style={styles.badgeNumber}>
            <Text style={styles.badgeNumberText}>2</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Purchased Medicines</Text>
            <Text style={styles.sectionSubtitle}>
              Upload 1 or more photos (Back side, composition, batch, QR)
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {medicineImages.length} {medicineImages.length === 1 ? 'image' : 'images'}
            </Text>
          </View>
        </View>

        {/* Medicine Image Grid / Previews */}
        {medicineImages.length > 0 && (
          <View style={styles.medicineGrid}>
            {medicineImages.map((item, index) => (
              <View key={item.id} style={styles.medicineGridItem}>
                <Image
                  source={{ uri: item.uri }}
                  style={styles.medicineThumb}
                  resizeMode="cover"
                />
                <View style={styles.medicineIndexPill}>
                  <Text style={styles.medicineIndexPillText}>#{index + 1}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeMedicineBtn}
                  onPress={() => removeMedicineImage(item.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={22} color={Colors.alertRed} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Quick Add Card in Grid */}
            <TouchableOpacity
              style={styles.addMoreCard}
              onPress={pickMedicineImages}
              activeOpacity={0.7}
            >
              <Feather name="plus-circle" size={24} color={Colors.tealDark} />
              <Text style={styles.addMoreCardText}>Add More</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty state or Add Medicine Options Bar */}
        <View style={styles.medicineUploadBox}>
          <View style={styles.medicineActionHeader}>
            <Text style={styles.medicineActionTitle}>
              {medicineImages.length === 0
                ? 'Upload Medicine Packaging / Back Side'
                : 'Upload More Angles or Additional Medicines'}
            </Text>
            {medicineImages.length > 0 && (
              <TouchableOpacity onPress={clearMedicineImages}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.uploadActionButtons}>
            <TouchableOpacity
              style={[styles.uploadBtn, styles.uploadBtnTeal]}
              onPress={captureMedicineImage}
              activeOpacity={0.8}
            >
              <Feather name="camera" size={17} color="#FFF" />
              <Text style={[styles.uploadBtnText, { color: '#FFF' }]}>
                Snap Back Side
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={pickMedicineImages}
              activeOpacity={0.8}
            >
              <Feather name="layers" size={17} color={Colors.charcoal} />
              <Text style={styles.uploadBtnText}>Select Photos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Back-side details hint */}
        <View style={styles.tipsBox}>
          <View style={styles.tipHeader}>
            <MaterialCommunityIcons name="information" size={17} color={Colors.tealDark} />
            <Text style={styles.tipsTitle}>What to capture on the back side:</Text>
          </View>
          <Text style={styles.tipsItem}>
            • <Text style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>Active Ingredients & Strength</Text> (e.g. Paracetamol 650mg)
          </Text>
          <Text style={styles.tipsItem}>
            • <Text style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>Manufacturer & Batch Details</Text> (B.No., MFD, EXP date)
          </Text>
          <Text style={styles.tipsItem}>
            • <Text style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>QR/Barcode & Warnings</Text> (Schedule H/H1 warning box)
          </Text>
        </View>
      </ScrollView>

      {/* Floating Bottom Verification Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (!prescriptionImage || medicineImages.length === 0) &&
              styles.verifyButtonDisabled,
          ]}
          onPress={handleStartVerification}
          disabled={!prescriptionImage || medicineImages.length === 0 || isVerifying}
          activeOpacity={0.85}
        >
          {isVerifying ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.verifyButtonText}>
                Auditing Rx vs Purchased Meds...
              </Text>
            </View>
          ) : (
            <>
              <MaterialCommunityIcons
                name="shield-search"
                size={22}
                color="#FFFFFF"
              />
              <Text style={styles.verifyButtonText}>
                Run Safety Audit ({medicineImages.length} med photo{medicineImages.length === 1 ? '' : 's'})
              </Text>
            </>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.cardWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.mintBg,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B0EBEB',
  },
  infoIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.tealDark,
    marginBottom: 3,
  },
  infoDesc: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  badgeNumberText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
  },
  readyTag: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  readyTagText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.successGreen,
  },
  countBadge: {
    backgroundColor: Colors.mintBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.tealDark,
  },
  prescriptionCard: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    position: 'relative',
    marginBottom: 16,
  },
  prescriptionPreview: {
    width: '100%',
    height: '100%',
  },
  prescriptionCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  imageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
  },
  imageBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  actionRowOverlay: {
    flexDirection: 'row',
    gap: 8,
  },
  overlayActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayActionBtnDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
  },
  emptyUploadBox: {
    backgroundColor: Colors.cardWhite,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  uploadBoxTitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
    marginTop: 10,
  },
  uploadBoxSub: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
    marginTop: 3,
    marginBottom: 16,
    textAlign: 'center',
  },
  uploadActionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  uploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.canvas,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  uploadBtnTeal: {
    backgroundColor: Colors.tealDark,
    borderColor: Colors.tealDark,
  },
  uploadBtnText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.charcoal,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 18,
  },
  medicineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  medicineGridItem: {
    width: '48%',
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  medicineThumb: {
    width: '100%',
    height: '100%',
  },
  medicineIndexPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  medicineIndexPillText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  removeMedicineBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  addMoreCard: {
    width: '48%',
    height: 120,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.tealDark,
    borderStyle: 'dashed',
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addMoreCardText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.tealDark,
  },
  medicineUploadBox: {
    backgroundColor: Colors.cardWhite,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 16,
  },
  medicineActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  medicineActionTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.textPrimary,
  },
  clearAllText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.alertRed,
  },
  tipsBox: {
    backgroundColor: Colors.cardWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 20,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
  },
  tipsItem: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.cardWhite,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.charcoal,
    borderRadius: 18,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  verifyButtonDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.7,
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
