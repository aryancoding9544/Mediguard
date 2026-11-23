import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Share,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useOrdersStore } from '../../store/useOrdersStore';
import { useScanStore } from '../../store/useScanStore';
import { LocalOrder } from '../../constants/types';

export default function OrdersScreen() {
  const router = useRouter();
  const { orders, deleteOrder, clearAllOrders, setSelectedOrderForChat } = useOrdersStore();
  const { loadAnalysisFromOrder } = useScanStore();

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'rx' | 'verify'>('all');
  const [selectedOrder, setSelectedOrder] = useState<LocalOrder | null>(null);
  const [zoomedImageUri, setZoomedImageUri] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === 'rx') return order.type === 'prescription_analysis';
    if (selectedFilter === 'verify') return order.type === 'verification';
    return true;
  });

  const rxCount = orders.filter((o) => o.type === 'prescription_analysis').length;
  const verifyCount = orders.filter((o) => o.type === 'verification').length;

  const handleClearAll = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all locally saved history? This will also remove the saved images from your device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearAllOrders(),
        },
      ]
    );
  };

  const handleDeleteItem = (order: LocalOrder) => {
    Alert.alert(
      'Delete Record',
      `Delete ${order.orderNumber} from your history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteOrder(order.id),
        },
      ]
    );
  };

  const handleOpenInScan = (order: LocalOrder) => {
    if (order.analysisResult) {
      loadAnalysisFromOrder(order.analysisResult, order.imageUri);
      setSelectedOrder(null);
      router.push('/scan/result');
    } else {
      Alert.alert('Notice', 'This record does not have prescription scan data.');
    }
  };

  const handleConsultDoctor = (order: LocalOrder) => {
    setSelectedOrderForChat(order);
    setSelectedOrder(null);
    router.push('/chat');
  };

  const handleShareReport = async (order: LocalOrder) => {
    try {
      let message = `MediGuard History Record - ${order.orderNumber}\n`;
      message += `Date: ${formatDate(order.createdAt)}\n`;
      if (order.type === 'verification') {
        message += `Type: Dual Verification Audit (Rx vs Medicine Packaging)\n`;
        message += `Status: ${order.status}\n`;
        message += `Summary: ${order.patientConcern || order.verificationResult?.summary || ''}\n`;
        if (order.verificationResult?.comparison_items) {
          message += `\nComparisons:\n`;
          order.verificationResult.comparison_items.forEach((ci, idx) => {
            message += `${idx + 1}. Prescribed: ${ci.prescribed_name} (${ci.prescribed_dosage}) vs Purchased: ${ci.purchased_product_name} [${ci.status}]\n`;
          });
        }
      } else {
        message += `Diagnosis/Concern: ${order.patientConcern || 'Prescription Analysis'}\n`;
        if (order.identifiedMedicines && order.identifiedMedicines.length > 0) {
          message += `\nIdentified Medicines:\n`;
          order.identifiedMedicines.forEach((m, idx) => {
            message += `${idx + 1}. ${m.name} (${m.dosage || 'As prescribed'})\n`;
            if (m.generic_name) message += `   Salt: ${m.generic_name}\n`;
          });
        }
      }
      if (order.batchNumber) {
        message += `\nBatch: ${order.batchNumber} | Recall Status: ${order.recallStatus || 'CLEAR'}\n`;
      }
      await Share.share({ message });
    } catch (e) {}
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>History</Text>
            {orders.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{orders.length} RECORDS</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>
            Locally stored prescription analytics & audits
          </Text>
        </View>

        {orders.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            activeOpacity={0.7}
            onPress={handleClearAll}
          >
            <Feather name="trash-2" size={18} color={Colors.alertRed} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      {orders.length > 0 && (
        <View style={styles.filterTabsRow}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === 'all' && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === 'all' && styles.filterTabTextActive,
              ]}
            >
              All ({orders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === 'rx' && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter('rx')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === 'rx' && styles.filterTabTextActive,
              ]}
            >
              Prescriptions ({rxCount})
            </Text>
          </TouchableOpacity>

          {verifyCount > 0 && (
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === 'verify' && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter('verify')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === 'verify' && styles.filterTabTextActive,
                ]}
              >
                Verifications ({verifyCount})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Main Body */}
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="clipboard-text-search-outline"
              size={38}
              color={Colors.tealDark}
            />
          </View>
          <Text style={styles.emptyTitle}>
            {orders.length === 0 ? 'No History Saved Yet' : 'No Matching Records'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {orders.length === 0
              ? 'When you analyze a prescription, its extracted medicines, diagnosis, batch safety, and image will be saved here in your history.'
              : 'Try selecting a different filter above.'}
          </Text>
          {orders.length === 0 && (
            <TouchableOpacity
              style={styles.scanNowBtn}
              activeOpacity={0.85}
              onPress={() => router.push('/scan')}
            >
              <Feather name="camera" size={17} color="#FFFFFF" />
              <Text style={styles.scanNowBtnText}>Scan Prescription Now</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isRx = item.type === 'prescription_analysis';
            const confidencePercent = Math.round((item.confidenceScore || 0.9) * 100);

            // Verification status styling
            const isMatch = item.status === 'MATCH';
            const isPartial = item.status === 'PARTIAL_MATCH';
            const isMismatch = item.status === 'MISMATCH';

            const statusBg = isRx
              ? confidencePercent >= 75
                ? '#ECFDF5'
                : '#FFFBEB'
              : isMatch
              ? '#ECFDF5'
              : isPartial
              ? '#FFFBEB'
              : '#FEF2F2';

            const statusColor = isRx
              ? confidencePercent >= 75
                ? Colors.tealDark
                : Colors.warningAmber
              : isMatch
              ? Colors.tealDark
              : isPartial
              ? Colors.warningAmber
              : Colors.alertRed;

            const statusLabel = isRx
              ? `${confidencePercent}% OCR Verified`
              : isMatch
              ? 'Verified Match'
              : isPartial
              ? 'Generic Substitute'
              : isMismatch
              ? 'Mismatch Alert'
              : item.status;

            const medImageUri =
              item.primaryMedicineImageUri ||
              (item.medicineImageUris && item.medicineImageUris[0]) ||
              null;
            const extraMedCount = (item.medicineImageUris?.length || 0) - 1;

            return (
              <View style={styles.orderCard}>
                {/* Card Top: Order # & Status Badge */}
                <View style={styles.cardTopRow}>
                  <View style={styles.orderNumberBox}>
                    <View style={styles.orderNumberHeaderRow}>
                      <Text style={styles.orderNumberText}>{item.orderNumber}</Text>
                      <View
                        style={[
                          styles.typeTag,
                          {
                            backgroundColor: isRx ? '#F0FDFA' : '#F5F3FF',
                            borderColor: isRx ? Colors.tealAccent : '#DDD6FE',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.typeTagText,
                            { color: isRx ? Colors.tealDark : '#7C3AED' },
                          ]}
                        >
                          {isRx ? 'Prescription' : 'Dual Verification'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.orderDateText}>
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>

                  <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusPillText, { color: statusColor }]}>
                      {statusLabel}
                    </Text>
                  </View>
                </View>

                {/* Card Middle: Image Thumbnail(s) & Details */}
                <View style={styles.cardMiddleRow}>
                  {isRx ? (
                    item.imageUri ? (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setZoomedImageUri(item.imageUri)}
                        style={styles.thumbnailWrapper}
                      >
                        <Image
                          source={{ uri: item.imageUri }}
                          style={styles.thumbnailImage}
                          resizeMode="cover"
                        />
                        <View style={styles.zoomIconOverlay}>
                          <Feather name="maximize-2" size={11} color="#FFF" />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.thumbnailPlaceholder}>
                        <Feather name="file-text" size={24} color={Colors.textMuted} />
                      </View>
                    )
                  ) : (
                    /* Dual Verification: Side-by-side Rx and Medicine Pack thumbnails */
                    <View style={styles.dualThumbnailContainer}>
                      {/* Rx Image */}
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setZoomedImageUri(item.imageUri)}
                        style={styles.dualThumbItem}
                      >
                        <Image
                          source={{ uri: item.imageUri }}
                          style={styles.thumbnailImage}
                          resizeMode="cover"
                        />
                        <View style={styles.thumbLabelBadge}>
                          <Text style={styles.thumbLabelBadgeText}>Rx</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Medicine Image */}
                      {medImageUri ? (
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => setZoomedImageUri(medImageUri)}
                          style={styles.dualThumbItem}
                        >
                          <Image
                            source={{ uri: medImageUri }}
                            style={styles.thumbnailImage}
                            resizeMode="cover"
                          />
                          <View style={[styles.thumbLabelBadge, { backgroundColor: '#7C3AED' }]}>
                            <Text style={styles.thumbLabelBadgeText}>Med</Text>
                          </View>
                          {extraMedCount > 0 && (
                            <View style={styles.extraCountBadge}>
                              <Text style={styles.extraCountText}>+{extraMedCount}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.dualThumbPlaceholder}>
                          <Feather name="package" size={18} color={Colors.textMuted} />
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.cardInfoCol}>
                    <Text style={styles.concernLabel}>
                      {isRx ? 'PATIENT CONCERN / DIAGNOSIS' : 'CROSS-CHECK AUDIT SUMMARY'}
                    </Text>
                    <Text style={styles.concernValue} numberOfLines={2}>
                      {item.patientConcern ||
                        (isRx ? 'General Medical Prescription' : 'Prescription vs Medicine Packaging')}
                    </Text>

                    <View style={styles.statsRow}>
                      <View style={styles.statPill}>
                        <Feather name="package" size={12} color={Colors.tealDark} />
                        <Text style={styles.statPillText}>
                          {item.totalMedicines}{' '}
                          {item.totalMedicines === 1 ? 'Medicine' : 'Medicines'}
                        </Text>
                      </View>

                      {item.batchNumber && (
                        <View style={styles.statPill}>
                          <Feather name="shield" size={12} color={Colors.tealDark} />
                          <Text style={styles.statPillText}>
                            Batch: {item.batchNumber}
                          </Text>
                        </View>
                      )}

                      {!isRx && item.verificationResult?.packaging_info?.manufacturer && (
                        <View style={styles.statPill}>
                          <Feather name="check" size={12} color={Colors.tealDark} />
                          <Text style={styles.statPillText} numberOfLines={1}>
                            {item.verificationResult.packaging_info.manufacturer}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Medicine Pills List */}
                {item.medicineNames && item.medicineNames.length > 0 && (
                  <View style={styles.medicineTagsWrapper}>
                    {item.medicineNames.map((medName, mIdx) => (
                      <View key={mIdx} style={styles.medChip}>
                        <Ionicons
                          name={isRx ? 'medical' : 'checkmark-done'}
                          size={11}
                          color={isRx ? Colors.tealDark : '#7C3AED'}
                        />
                        <Text style={styles.medChipText} numberOfLines={1}>
                          {medName}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Card Bottom Actions */}
                <View style={styles.cardBottomBar}>
                  <TouchableOpacity
                    style={styles.deleteIconButton}
                    activeOpacity={0.7}
                    onPress={() => handleDeleteItem(item)}
                  >
                    <Feather name="trash-2" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>

                  <View style={styles.rightButtonsRow}>
                    <TouchableOpacity
                      style={styles.chatCardBtn}
                      activeOpacity={0.8}
                      onPress={() => handleConsultDoctor(item)}
                    >
                      <MaterialCommunityIcons
                        name="stethoscope"
                        size={13}
                        color={Colors.tealDark}
                      />
                      <Text style={styles.chatCardBtnText}>Ask Dr. AI</Text>
                    </TouchableOpacity>

                    {isRx && (
                      <TouchableOpacity
                        style={styles.secondaryCardBtn}
                        activeOpacity={0.8}
                        onPress={() => handleOpenInScan(item)}
                      >
                        <Feather name="external-link" size={13} color={Colors.charcoal} />
                        <Text style={styles.secondaryCardBtnText}>Scan View</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.primaryCardBtn}
                      activeOpacity={0.85}
                      onPress={() => setSelectedOrder(item)}
                    >
                      <Feather name="eye" size={13} color="#FFFFFF" />
                      <Text style={styles.primaryCardBtnText}>
                        {isRx ? 'Full Analysis' : 'Full Audit'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* FULL ANALYSIS DETAILS MODAL */}
      <Modal
        visible={!!selectedOrder}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedOrder(null)}
      >
        {selectedOrder && (
          <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
            {/* Modal Header */}
            <View style={styles.modalTopBar}>
              <TouchableOpacity
                style={styles.modalCloseCircle}
                activeOpacity={0.7}
                onPress={() => setSelectedOrder(null)}
              >
                <Feather name="x" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
              <View style={styles.modalTitleBlock}>
                <Text style={styles.modalMainTitle}>{selectedOrder.orderNumber}</Text>
                <Text style={styles.modalSubTitle}>
                  {formatDate(selectedOrder.createdAt)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseCircle}
                activeOpacity={0.7}
                onPress={() => handleShareReport(selectedOrder)}
              >
                <Feather name="share-2" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedOrder.type === 'verification' ? (
                /* ================= DUAL VERIFICATION FULL AUDIT VIEW ================= */
                <>
                  {/* Dual Visual Gallery: Prescription Photo & Medicine Packaging Photos */}
                  <View style={styles.detailCard}>
                    <View style={styles.detailSectionHeader}>
                      <Feather name="layers" size={16} color="#7C3AED" />
                      <Text style={[styles.detailSectionTitle, { color: '#7C3AED' }]}>
                        Dual Visual Evidence (Rx vs Medicine Packaging)
                      </Text>
                    </View>

                    {/* 1. Prescription Photo */}
                    <Text style={styles.evidenceSubheading}>1. Doctor's Prescription (Rx)</Text>
                    {selectedOrder.imageUri ? (
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setZoomedImageUri(selectedOrder.imageUri)}
                        style={styles.modalImageContainer}
                      >
                        <Image
                          source={{ uri: selectedOrder.imageUri }}
                          style={styles.modalPrescriptionImg}
                          resizeMode="cover"
                        />
                        <View style={styles.enlargePill}>
                          <Feather name="maximize-2" size={12} color="#FFF" />
                          <Text style={styles.enlargePillText}>Prescription Photo • Tap to Enlarge</Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.noImagePlaceholder}>
                        <Text style={styles.noImageText}>No prescription image recorded</Text>
                      </View>
                    )}

                    {/* 2. Medicine Packaging Photos */}
                    <Text style={[styles.evidenceSubheading, { marginTop: 14 }]}>
                      2. Purchased Medicine Packaging (
                      {(selectedOrder.medicineImageUris && selectedOrder.medicineImageUris.length > 0)
                        ? `${selectedOrder.medicineImageUris.length} photos`
                        : '1 photo'}
                      )
                    </Text>

                    {selectedOrder.medicineImageUris && selectedOrder.medicineImageUris.length > 0 ? (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.medGalleryScroll}
                      >
                        {selectedOrder.medicineImageUris.map((mUri, mIdx) => (
                          <TouchableOpacity
                            key={mIdx}
                            activeOpacity={0.9}
                            onPress={() => setZoomedImageUri(mUri)}
                            style={styles.modalGalleryItem}
                          >
                            <Image
                              source={{ uri: mUri }}
                              style={styles.modalGalleryImg}
                              resizeMode="cover"
                            />
                            <View style={styles.galleryBadgeOverlay}>
                              <Text style={styles.galleryBadgeText}>Photo #{mIdx + 1}</Text>
                              <Feather name="maximize-2" size={10} color="#FFF" />
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    ) : selectedOrder.primaryMedicineImageUri ? (
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setZoomedImageUri(selectedOrder.primaryMedicineImageUri!)}
                        style={styles.modalImageContainer}
                      >
                        <Image
                          source={{ uri: selectedOrder.primaryMedicineImageUri }}
                          style={styles.modalPrescriptionImg}
                          resizeMode="cover"
                        />
                        <View style={styles.enlargePill}>
                          <Feather name="maximize-2" size={12} color="#FFF" />
                          <Text style={styles.enlargePillText}>Medicine Photo • Tap to Enlarge</Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.noImagePlaceholder}>
                        <Text style={styles.noImageText}>No medicine photo recorded</Text>
                      </View>
                    )}
                  </View>

                  {/* Audit Summary & Overall Match Banner */}
                  <View style={styles.detailCard}>
                    <View style={styles.detailSectionHeader}>
                      <Ionicons
                        name={
                          selectedOrder.status === 'MATCH'
                            ? 'checkmark-circle'
                            : selectedOrder.status === 'PARTIAL_MATCH'
                            ? 'alert-circle'
                            : 'warning'
                        }
                        size={18}
                        color={
                          selectedOrder.status === 'MATCH'
                            ? Colors.tealDark
                            : selectedOrder.status === 'PARTIAL_MATCH'
                            ? Colors.warningAmber
                            : Colors.alertRed
                        }
                      />
                      <Text style={styles.detailSectionTitle}>Verification Match Assessment</Text>
                    </View>

                    <View
                      style={[
                        styles.auditBannerBox,
                        {
                          backgroundColor:
                            selectedOrder.status === 'MATCH'
                              ? '#ECFDF5'
                              : selectedOrder.status === 'PARTIAL_MATCH'
                              ? '#FFFBEB'
                              : '#FEF2F2',
                          borderColor:
                            selectedOrder.status === 'MATCH'
                              ? '#A7F3D0'
                              : selectedOrder.status === 'PARTIAL_MATCH'
                              ? '#FDE68A'
                              : '#FECACA',
                        },
                      ]}
                    >
                      <View style={styles.auditBannerHeader}>
                        <Text
                          style={[
                            styles.auditBannerTitle,
                            {
                              color:
                                selectedOrder.status === 'MATCH'
                                  ? Colors.tealDark
                                  : selectedOrder.status === 'PARTIAL_MATCH'
                                  ? '#92400E'
                                  : Colors.alertRed,
                            },
                          ]}
                        >
                          {selectedOrder.status === 'MATCH'
                            ? '✅ VERIFIED EXACT MATCH'
                            : selectedOrder.status === 'PARTIAL_MATCH'
                            ? '⚠️ GENERIC / APPROVED SUBSTITUTE'
                            : '🚨 DISCREPANCY / MISMATCH DETECTED'}
                        </Text>
                        <Text style={styles.confidenceScorePill}>
                          {Math.round((selectedOrder.confidenceScore || 0.88) * 100)}% Confidence
                        </Text>
                      </View>

                      <Text style={styles.auditSummaryText}>
                        {selectedOrder.verificationResult?.summary ||
                          selectedOrder.patientConcern ||
                          'Dual cross-check audit performed.'}
                      </Text>
                    </View>
                  </View>

                  {/* Medicine Comparisons (Prescribed vs Purchased) */}
                  {selectedOrder.verificationResult?.comparison_items &&
                    selectedOrder.verificationResult.comparison_items.length > 0 && (
                      <View style={styles.detailCard}>
                        <View style={styles.detailSectionHeader}>
                          <MaterialCommunityIcons name="compare-horizontal" size={18} color={Colors.tealDark} />
                          <Text style={styles.detailSectionTitle}>
                            Prescription vs Purchased Product ({selectedOrder.verificationResult.comparison_items.length})
                          </Text>
                        </View>

                        {selectedOrder.verificationResult.comparison_items.map((ci, cIdx) => (
                          <View key={cIdx} style={styles.comparisonCard}>
                            <View style={styles.comparisonHeaderRow}>
                              <Text style={styles.comparisonIndexText}>Item #{cIdx + 1}</Text>
                              <View
                                style={[
                                  styles.comparisonMatchPill,
                                  {
                                    backgroundColor: ci.is_exact_match
                                      ? '#ECFDF5'
                                      : ci.is_generic_equivalent
                                      ? '#FFFBEB'
                                      : '#FEF2F2',
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.comparisonMatchText,
                                    {
                                      color: ci.is_exact_match
                                        ? Colors.tealDark
                                        : ci.is_generic_equivalent
                                        ? Colors.warningAmber
                                        : Colors.alertRed,
                                    },
                                  ]}
                                >
                                  {ci.status || (ci.is_exact_match ? 'EXACT MATCH' : 'SUBSTITUTE')}
                                </Text>
                              </View>
                            </View>

                            <View style={styles.compDualRow}>
                              <View style={styles.compCol}>
                                <Text style={styles.compSideLabel}>DOCTOR PRESCRIBED</Text>
                                <Text style={styles.compDrugName}>{ci.prescribed_name}</Text>
                                <Text style={styles.compDosageText}>
                                  Dosage: {ci.prescribed_dosage || 'As indicated'}
                                </Text>
                              </View>

                              <View style={styles.compDivider} />

                              <View style={styles.compCol}>
                                <Text style={[styles.compSideLabel, { color: '#7C3AED' }]}>
                                  PURCHASED PRODUCT
                                </Text>
                                <Text style={styles.compDrugName}>{ci.purchased_product_name}</Text>
                                <Text style={styles.compDosageText}>
                                  Salt: {ci.purchased_composition || 'Label composition'}
                                </Text>
                              </View>
                            </View>

                            {ci.explanation && (
                              <View style={styles.compExplanationBox}>
                                <Feather name="info" size={13} color={Colors.textSecondary} />
                                <Text style={styles.compExplanationText}>{ci.explanation}</Text>
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    )}

                  {/* Packaging & Authenticity Verification */}
                  {selectedOrder.verificationResult?.packaging_info && (
                    <View style={styles.detailCard}>
                      <View style={styles.detailSectionHeader}>
                        <MaterialCommunityIcons name="shield-check" size={18} color={Colors.tealDark} />
                        <Text style={styles.detailSectionTitle}>Packaging & Authenticity Audit</Text>
                      </View>

                      <View style={styles.batchGrid}>
                        <View style={styles.batchItem}>
                          <Text style={styles.batchLabel}>Brand Name</Text>
                          <Text style={styles.batchValue} numberOfLines={1}>
                            {selectedOrder.verificationResult.packaging_info.brand_name || 'N/A'}
                          </Text>
                        </View>
                        <View style={styles.batchItem}>
                          <Text style={styles.batchLabel}>Manufacturer</Text>
                          <Text style={styles.batchValue} numberOfLines={1}>
                            {selectedOrder.verificationResult.packaging_info.manufacturer || 'N/A'}
                          </Text>
                        </View>
                        <View style={styles.batchItem}>
                          <Text style={styles.batchLabel}>Batch Number</Text>
                          <Text style={styles.batchValue}>
                            {selectedOrder.verificationResult.packaging_info.batch_number || 'N/A'}
                          </Text>
                        </View>
                        <View style={styles.batchItem}>
                          <Text style={styles.batchLabel}>Expiry Date</Text>
                          <Text
                            style={[
                              styles.batchValue,
                              {
                                color: selectedOrder.verificationResult.packaging_info.is_expired
                                  ? Colors.alertRed
                                  : Colors.tealDark,
                              },
                            ]}
                          >
                            {selectedOrder.verificationResult.packaging_info.expiry_date || 'N/A'}
                            {selectedOrder.verificationResult.packaging_info.is_expired ? ' (EXPIRED)' : ''}
                          </Text>
                        </View>
                      </View>

                      {selectedOrder.verificationResult.packaging_info.authenticity_notes && (
                        <View style={styles.authenticityNotesBox}>
                          <Text style={styles.authenticityNotesLabel}>Packaging Authenticity Notes:</Text>
                          <Text style={styles.authenticityNotesText}>
                            {selectedOrder.verificationResult.packaging_info.authenticity_notes}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Safety Alerts */}
                  {selectedOrder.verificationResult?.safety_alerts &&
                    selectedOrder.verificationResult.safety_alerts.length > 0 && (
                      <View style={styles.detailCard}>
                        <View style={styles.detailSectionHeader}>
                          <Feather name="alert-triangle" size={16} color={Colors.warningAmber} />
                          <Text style={[styles.detailSectionTitle, { color: '#92400E' }]}>
                            Safety Alerts & Precautions
                          </Text>
                        </View>
                        {selectedOrder.verificationResult.safety_alerts.map((alert, aIdx) => (
                          <View key={aIdx} style={styles.alertRow}>
                            <Feather name="alert-circle" size={14} color={Colors.alertRed} />
                            <Text style={styles.alertRowText}>{alert}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                  {/* Clinical Guidance */}
                  {selectedOrder.verificationResult?.guidance && (
                    <View style={styles.detailCard}>
                      <View style={styles.detailSectionHeader}>
                        <MaterialCommunityIcons name="doctor" size={18} color={Colors.tealDark} />
                        <Text style={styles.detailSectionTitle}>Pharmacist Guidance</Text>
                      </View>
                      <Text style={styles.guidanceText}>
                        {selectedOrder.verificationResult.guidance}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                /* ================= STANDARD PRESCRIPTION ANALYSIS VIEW ================= */
                <>
                  {/* Preserved Prescription Image Card */}
                  {selectedOrder.imageUri && (
                    <View style={styles.detailCard}>
                      <View style={styles.detailSectionHeader}>
                        <Feather name="image" size={16} color={Colors.tealDark} />
                        <Text style={styles.detailSectionTitle}>
                          Captured Prescription Image
                        </Text>
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setZoomedImageUri(selectedOrder.imageUri)}
                        style={styles.modalImageContainer}
                      >
                        <Image
                          source={{ uri: selectedOrder.imageUri }}
                          style={styles.modalPrescriptionImg}
                          resizeMode="cover"
                        />
                        <View style={styles.enlargePill}>
                          <Feather name="maximize-2" size={12} color="#FFF" />
                          <Text style={styles.enlargePillText}>Tap to Enlarge</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Diagnosis / Patient Concern */}
                  <View style={styles.detailCard}>
                    <View style={styles.detailSectionHeader}>
                      <Feather name="activity" size={16} color={Colors.tealDark} />
                      <Text style={styles.detailSectionTitle}>Diagnosis & Concern</Text>
                    </View>
                    <View style={styles.concernHighlightBox}>
                      <Text style={styles.concernHighlightText}>
                        {selectedOrder.patientConcern || 'Not specified on prescription'}
                      </Text>
                      <View style={styles.confidenceRow}>
                        <Text style={styles.confidenceLabel}>Analysis Confidence:</Text>
                        <Text style={styles.confidenceVal}>
                          {Math.round((selectedOrder.confidenceScore || 0.9) * 100)}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Identified Medicines List */}
                  {selectedOrder.identifiedMedicines &&
                    selectedOrder.identifiedMedicines.length > 0 && (
                      <View style={styles.detailCard}>
                        <View style={styles.detailSectionHeader}>
                          <Ionicons name="medical" size={16} color={Colors.tealDark} />
                          <Text style={styles.detailSectionTitle}>
                            Extracted Medicines ({selectedOrder.identifiedMedicines.length})
                          </Text>
                        </View>

                        {selectedOrder.identifiedMedicines.map((med, mIndex) => (
                          <View key={mIndex} style={styles.medDetailCard}>
                            <View style={styles.medDetailHeader}>
                              <Text style={styles.medNameBig}>{med.name}</Text>
                              {med.dosage ? (
                                <View style={styles.dosagePill}>
                                  <Text style={styles.dosagePillText}>{med.dosage}</Text>
                                </View>
                              ) : null}
                            </View>

                            {med.generic_name ? (
                              <Text style={styles.saltText}>
                                Active Salt / Generic: {med.generic_name}
                              </Text>
                            ) : null}

                            {med.therapeutic_class ? (
                              <View style={styles.propRow}>
                                <Text style={styles.propLabel}>Therapeutic Class:</Text>
                                <Text style={styles.propVal}>{med.therapeutic_class}</Text>
                              </View>
                            ) : null}

                            {med.primary_uses ? (
                              <View style={styles.propRow}>
                                <Text style={styles.propLabel}>Primary Uses:</Text>
                                <Text style={styles.propVal}>{med.primary_uses}</Text>
                              </View>
                            ) : null}

                            {med.warnings ? (
                              <View style={styles.medWarningBox}>
                                <Feather
                                  name="alert-triangle"
                                  size={14}
                                  color={Colors.warningAmber}
                                />
                                <Text style={styles.medWarningText}>{med.warnings}</Text>
                              </View>
                            ) : null}
                          </View>
                        ))}
                      </View>
                    )}

                  {/* Batch Verification Safety Status */}
                  {selectedOrder.analysisResult?.batch_verification && (
                    <View style={styles.detailCard}>
                      <View style={styles.detailSectionHeader}>
                        <Feather name="shield" size={16} color={Colors.tealDark} />
                        <Text style={styles.detailSectionTitle}>Batch Safety Registry</Text>
                      </View>
                      <View style={styles.batchGrid}>
                        <View style={styles.batchItem}>
                          <Text style={styles.batchLabel}>Batch No.</Text>
                          <Text style={styles.batchValue}>
                            {selectedOrder.analysisResult.batch_verification.batch_number || 'N/A'}
                          </Text>
                        </View>
                        <View style={styles.batchItem}>
                          <Text style={styles.batchLabel}>Recall Status</Text>
                          <Text
                            style={[
                              styles.batchValue,
                              {
                                color:
                                  selectedOrder.analysisResult.batch_verification
                                    .recall_status === 'CLEAR'
                                    ? Colors.successGreen
                                    : Colors.alertRed,
                              },
                            ]}
                          >
                            {selectedOrder.analysisResult.batch_verification.recall_status}
                          </Text>
                        </View>
                        <View style={styles.batchItem}>
                          <Text style={styles.batchLabel}>Expiry Date</Text>
                          <Text style={styles.batchValue}>
                            {selectedOrder.analysisResult.batch_verification.expiry_date || 'N/A'}
                          </Text>
                        </View>
                        <View style={styles.batchItem}>
                          <Text style={styles.batchLabel}>Database</Text>
                          <Text style={styles.batchValue}>
                            {selectedOrder.analysisResult.batch_verification.database || 'Verified'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Uncertain Segments Flagged by Gemini OCR */}
                  {selectedOrder.analysisResult?.uncertain_segments &&
                    selectedOrder.analysisResult.uncertain_segments.length > 0 && (
                      <View style={styles.detailCard}>
                        <View style={styles.detailSectionHeader}>
                          <Feather
                            name="help-circle"
                            size={16}
                            color={Colors.warningAmber}
                          />
                          <Text
                            style={[
                              styles.detailSectionTitle,
                              { color: Colors.warningAmber },
                            ]}
                          >
                            Uncertain / Hard-to-Read Handwriting
                          </Text>
                        </View>
                        {selectedOrder.analysisResult.uncertain_segments.map((seg, sIdx) => (
                          <Text key={sIdx} style={styles.uncertainSegmentText}>
                            • "{seg}"
                          </Text>
                        ))}
                      </View>
                    )}

                  {/* Raw OCR Text (collapsible) */}
                  {selectedOrder.analysisResult?.extracted_raw_text && (
                    <View style={styles.detailCard}>
                      <TouchableOpacity
                        style={styles.collapsibleHeader}
                        activeOpacity={0.7}
                        onPress={() => setShowRawText(!showRawText)}
                      >
                        <View style={styles.detailSectionHeader}>
                          <Feather name="file-text" size={16} color={Colors.tealDark} />
                          <Text style={styles.detailSectionTitle}>
                            Raw OCR Extracted Text
                          </Text>
                        </View>
                        <Feather
                          name={showRawText ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color={Colors.textSecondary}
                        />
                      </TouchableOpacity>
                      {showRawText && (
                        <Text style={styles.rawTextDisplay}>
                          {selectedOrder.analysisResult.extracted_raw_text}
                        </Text>
                      )}
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            {/* Bottom Actions inside Modal */}
            <View style={styles.modalBottomBar}>
              <TouchableOpacity
                style={styles.modalConsultDoctorBtn}
                activeOpacity={0.85}
                onPress={() => handleConsultDoctor(selectedOrder)}
              >
                <MaterialCommunityIcons name="stethoscope" size={18} color="#FFF" />
                <Text style={styles.modalConsultDoctorText}>
                  {selectedOrder.type === 'verification'
                    ? 'Consult Dr. MediGuard About This Audit'
                    : 'Consult Dr. MediGuard About This Rx'}
                </Text>
              </TouchableOpacity>

              {selectedOrder.type === 'prescription_analysis' && (
                <TouchableOpacity
                  style={styles.modalPrimaryActionBtn}
                  activeOpacity={0.85}
                  onPress={() => handleOpenInScan(selectedOrder)}
                >
                  <Feather name="external-link" size={16} color={Colors.charcoal} />
                  <Text style={styles.modalSecondaryActionText}>
                    Open in Full Scan Screen
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        )}
      </Modal>

      {/* FULL-SCREEN ZOOM IMAGE MODAL */}
      <Modal
        visible={!!zoomedImageUri}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setZoomedImageUri(null)}
      >
        <View style={styles.fullscreenBackdrop}>
          <SafeAreaView style={styles.fullscreenSafeContainer}>
            <View style={styles.fullscreenHeader}>
              <Text style={styles.fullscreenTitle}>Prescription Photo</Text>
              <TouchableOpacity
                style={styles.fullscreenCloseBtn}
                onPress={() => setZoomedImageUri(null)}
              >
                <Feather name="x" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            {zoomedImageUri && (
              <Image
                source={{ uri: zoomedImageUri }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            )}
          </SafeAreaView>
        </View>
      </Modal>
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
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.textPrimary,
  },
  countBadge: {
    backgroundColor: Colors.mintBg,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.tealAccent,
  },
  countBadgeText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.tealDark,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  clearBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.cardWhite,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  filterTabActive: {
    backgroundColor: Colors.charcoal,
    borderColor: Colors.charcoal,
  },
  filterTabText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 80,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.mintBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  scanNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.charcoal,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 9999,
  },
  scanNowBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  listContent: {
    paddingHorizontal: 22,
    paddingBottom: 130,
    gap: 14,
  },
  orderCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  orderNumberBox: {
    gap: 2,
  },
  orderNumberHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderNumberText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.textPrimary,
  },
  typeTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeTagText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 0.3,
  },
  orderDateText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  cardMiddleRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  thumbnailWrapper: {
    width: 72,
    height: 72,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  zoomIconOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 6,
    padding: 3,
  },
  thumbnailPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dualThumbnailContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  dualThumbItem: {
    width: 58,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dualThumbPlaceholder: {
    width: 58,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbLabelBadge: {
    position: 'absolute',
    top: 3,
    left: 3,
    backgroundColor: Colors.tealDark,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  thumbLabelBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  extraCountBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  extraCountText: {
    color: '#FFF',
    fontSize: 9,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  cardInfoCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  concernLabel: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  concernValue: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statPillText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.tealDark,
  },
  medicineTagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingBottom: 12,
  },
  medChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  medChipText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.charcoal,
  },
  cardBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  deleteIconButton: {
    padding: 8,
  },
  rightButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chatCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  chatCardBtnText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.tealDark,
  },
  secondaryCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  secondaryCardBtnText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.charcoal,
  },
  primaryCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.charcoal,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
  },
  primaryCardBtnText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.cardWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalCloseCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleBlock: {
    alignItems: 'center',
  },
  modalMainTitle: {
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.textPrimary,
  },
  modalSubTitle: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 18,
    paddingBottom: 40,
    gap: 14,
  },
  detailCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  detailSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
  },
  modalImageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  modalPrescriptionImg: {
    width: '100%',
    height: '100%',
  },
  enlargePill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  enlargePillText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  concernHighlightBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  concernHighlightText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  confidenceLabel: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
  },
  confidenceVal: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.tealDark,
  },
  medDetailCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3.5,
    borderLeftColor: Colors.tealAccent,
  },
  medDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  medNameBig: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.textPrimary,
  },
  dosagePill: {
    backgroundColor: Colors.mintBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dosagePillText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.tealDark,
  },
  saltText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  propRow: {
    marginTop: 4,
  },
  propLabel: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.textSecondary,
  },
  propVal: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textPrimary,
    lineHeight: 16,
  },
  medWarningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  medWarningText: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#92400E',
    lineHeight: 15,
  },
  batchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  batchItem: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
  },
  batchLabel: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  batchValue: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
  },
  uncertainSegmentText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.warningAmber,
    lineHeight: 18,
    marginBottom: 2,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rawTextDisplay: {
    marginTop: 10,
    fontSize: 11,
    fontFamily: 'Courier',
    color: Colors.charcoal,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    lineHeight: 16,
  },
  evidenceSubheading: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noImagePlaceholder: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textMuted,
  },
  medGalleryScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  modalGalleryItem: {
    width: 130,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  modalGalleryImg: {
    width: '100%',
    height: '100%',
  },
  galleryBadgeOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  galleryBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  auditBannerBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  auditBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  auditBannerTitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: 0.3,
  },
  confidenceScorePill: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textSecondary,
  },
  auditSummaryText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textPrimary,
    lineHeight: 19,
  },
  comparisonCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  comparisonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  comparisonIndexText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textSecondary,
  },
  comparisonMatchPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  comparisonMatchText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: 0.4,
  },
  compDualRow: {
    flexDirection: 'row',
    gap: 8,
  },
  compCol: {
    flex: 1,
    gap: 3,
  },
  compDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  compSideLabel: {
    fontSize: 9,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.tealDark,
    letterSpacing: 0.5,
  },
  compDrugName: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
  },
  compDosageText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
  },
  compExplanationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  compExplanationText: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.charcoal,
    lineHeight: 15,
  },
  authenticityNotesBox: {
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    gap: 3,
  },
  authenticityNotesLabel: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textSecondary,
  },
  authenticityNotesText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textPrimary,
    lineHeight: 17,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  alertRowText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.alertRed,
    lineHeight: 17,
  },
  guidanceText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textPrimary,
    lineHeight: 20,
    backgroundColor: '#F0FDFA',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.tealDark,
  },
  modalConsultDoctorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.tealDark,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 8,
  },
  modalConsultDoctorText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#FFFFFF',
  },
  modalSecondaryActionText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.charcoal,
  },
  modalBottomBar: {
    padding: 16,
    backgroundColor: Colors.cardWhite,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  modalPrimaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.charcoal,
    paddingVertical: 14,
    borderRadius: 16,
  },
  modalPrimaryActionText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#FFFFFF',
  },
  fullscreenBackdrop: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenSafeContainer: {
    flex: 1,
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  fullscreenTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  fullscreenCloseBtn: {
    padding: 8,
  },
  fullscreenImage: {
    flex: 1,
    width: '100%',
  },
});
