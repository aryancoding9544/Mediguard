import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { sendDoctorChatMessage } from '../../services/api';
import { useOrdersStore } from '../../store/useOrdersStore';
import { LocalOrder } from '../../constants/types';

interface Message {
  id: string;
  sender: 'user' | 'doctor';
  text: string;
  timestamp: string;
  attachedOrder?: {
    orderNumber: string;
    patientConcern?: string;
  };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg_welcome',
    sender: 'doctor',
    text: "Hello! I am **Dr. MediGuard**, your AI Clinical Consultant.\n\nYou can ask me general health questions or **attach a prescription from your history** using the button below to get specific guidance about your diagnosed medicines, dosages, and interactions.\n\nHow can I help you today?",
    timestamp: 'Just now',
  },
];

const DEFAULT_SUGGESTIONS = [
  '💊 Can I take pain relief on an empty stomach?',
  '⚠️ What if I missed a dose of antibiotics?',
  '🍽️ Food interactions to avoid with blood pressure meds',
  '🤕 Safe dosage for Paracetamol 650mg',
];

const RX_SUGGESTIONS = [
  '💊 Explain how to take these prescribed medicines',
  '⚠️ Are there any side effects I should watch for?',
  '🍽️ Should I take these before or after meals?',
  '🕒 What happens if I miss a scheduled dose?',
];

const VERIFICATION_SUGGESTIONS = [
  '🔍 Is this purchased medicine a safe substitute for my prescription?',
  '🧪 Can you explain the difference in salts/composition between the two?',
  '✅ Are the batch and expiry date verified and safe to use?',
  '💡 Does this generic brand have the exact same clinical effectiveness?',
];

export default function ChatScreen() {
  const { orders, selectedOrderForChat, setSelectedOrderForChat } = useOrdersStore();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LocalOrder | null>(null);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Sync when an order was selected from History screen
  useEffect(() => {
    if (selectedOrderForChat) {
      setSelectedOrder(selectedOrderForChat);
      setSelectedOrderForChat(null);
    }
  }, [selectedOrderForChat]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedOrder: selectedOrder
        ? {
            orderNumber: selectedOrder.orderNumber,
            patientConcern: selectedOrder.patientConcern,
          }
        : undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history for API
      const historyPayload = newMessages
        .filter((m) => m.id !== 'msg_welcome')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text,
        }));

      // Package attached prescription or verification audit data from history
      const attachedPrescriptionPayload = selectedOrder
        ? {
            order_number: selectedOrder.orderNumber,
            created_at: selectedOrder.createdAt,
            type: selectedOrder.type,
            patient_concern: selectedOrder.patientConcern,
            confidence_score: selectedOrder.confidenceScore,
            medicines: selectedOrder.identifiedMedicines || [],
            batch_verification: selectedOrder.analysisResult?.batch_verification,
            raw_text: selectedOrder.analysisResult?.extracted_raw_text,
            // Verification specific audit data
            verification_result: selectedOrder.verificationResult
              ? {
                  status: selectedOrder.verificationResult.status,
                  summary: selectedOrder.verificationResult.summary,
                  guidance: selectedOrder.verificationResult.guidance,
                  safety_alerts: selectedOrder.verificationResult.safety_alerts,
                  packaging_info: selectedOrder.verificationResult.packaging_info,
                  comparison_items: selectedOrder.verificationResult.comparison_items,
                }
              : undefined,
          }
        : undefined;

      // Call Gemini Doctor API
      const replyText = await sendDoctorChatMessage(
        textToSend,
        historyPayload,
        attachedPrescriptionPayload
      );

      const doctorMessage: Message = {
        id: `doc_${Date.now()}`,
        sender: 'doctor',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, doctorMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        id: `err_${Date.now()}`,
        sender: 'doctor',
        text: `I apologize, but I could not connect to the clinical service: ${err?.message || 'Connection error'}.\n\nPlease ensure your backend server is running and try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      'Restart Consultation',
      'Clear current chat conversation with Dr. MediGuard?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMessages(INITIAL_MESSAGES);
            setSelectedOrder(null);
          },
        },
      ]
    );
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isDoctor = item.sender === 'doctor';

    return (
      <View
        style={[
          styles.messageRow,
          isDoctor ? styles.doctorMessageRow : styles.userMessageRow,
        ]}
      >
        {isDoctor && (
          <View style={styles.doctorAvatar}>
            <MaterialCommunityIcons name="doctor" size={20} color={Colors.tealDark} />
          </View>
        )}

        <View
          style={[
            styles.bubble,
            isDoctor ? styles.doctorBubble : styles.userBubble,
          ]}
        >
          {isDoctor && (
            <View style={styles.doctorBadgeHeader}>
              <Text style={styles.doctorName}>Dr. MediGuard</Text>
              <View style={styles.verifiedTag}>
                <Ionicons name="checkmark-circle" size={12} color={Colors.tealDark} />
                <Text style={styles.verifiedTagText}>AI Doctor</Text>
              </View>
            </View>
          )}

          {/* Attached Rx reference badge on user bubble */}
          {!isDoctor && item.attachedOrder && (
            <View style={styles.messageAttachmentBadge}>
              <Feather name="paperclip" size={11} color="#A7F3D0" />
              <Text style={styles.messageAttachmentText} numberOfLines={1}>
                Referencing {item.attachedOrder.orderNumber}: {item.attachedOrder.patientConcern || 'Prescription'}
              </Text>
            </View>
          )}

          <Text
            style={[
              styles.messageText,
              isDoctor ? styles.doctorText : styles.userText,
            ]}
          >
            {item.text}
          </Text>

          <Text
            style={[
              styles.timestampText,
              isDoctor ? styles.doctorTimestamp : styles.userTimestamp,
            ]}
          >
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.doctorHeaderIcon}>
            <MaterialCommunityIcons name="stethoscope" size={24} color={Colors.tealDark} />
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.title}>Dr. MediGuard</Text>
            <Text style={styles.statusSubtitle}>AI Clinical Physician • Online</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.clearButton}
          activeOpacity={0.7}
          onPress={handleClearChat}
        >
          <Feather name="rotate-ccw" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.typingRow}>
                <View style={styles.doctorAvatar}>
                  <MaterialCommunityIcons name="doctor" size={20} color={Colors.tealDark} />
                </View>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color={Colors.tealDark} />
                  <Text style={styles.typingText}>Dr. MediGuard is reviewing...</Text>
                </View>
              </View>
            ) : undefined
          }
        />

        {/* Suggested Quick Inquiries */}
        {messages.length <= 2 && !isLoading && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>
              {selectedOrder
                ? selectedOrder.type === 'verification'
                  ? `Dual Verification Questions for ${selectedOrder.orderNumber}:`
                  : `Questions for ${selectedOrder.orderNumber}:`
                : 'Suggested Clinical Inquiries:'}
            </Text>
            <View style={styles.suggestionsList}>
              {(selectedOrder
                ? selectedOrder.type === 'verification'
                  ? VERIFICATION_SUGGESTIONS
                  : RX_SUGGESTIONS
                : DEFAULT_SUGGESTIONS
              ).map((q, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionChip}
                  activeOpacity={0.75}
                  onPress={() => handleSend(q)}
                >
                  <Text style={styles.suggestionText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ================= ATTACHED CONTEXT AREA ================= */}
        <View style={styles.attachmentAreaContainer}>
          {selectedOrder ? (
            /* Active Attached Context Card */
            <View style={styles.attachedPreviewCard}>
              <View style={styles.attachedCardLeft}>
                {selectedOrder.type === 'verification' ? (
                  /* Dual thumbnails for verification */
                  <View style={styles.attachedDualThumbRow}>
                    <View style={styles.attachedMiniThumbBox}>
                      <Image
                        source={{ uri: selectedOrder.imageUri }}
                        style={styles.attachedThumbnailImg}
                        resizeMode="cover"
                      />
                      <View style={styles.attachedMiniTag}>
                        <Text style={styles.attachedMiniTagText}>Rx</Text>
                      </View>
                    </View>
                    <View style={styles.attachedMiniThumbBox}>
                      <Image
                        source={{
                          uri:
                            selectedOrder.primaryMedicineImageUri ||
                            (selectedOrder.medicineImageUris && selectedOrder.medicineImageUris[0]) ||
                            selectedOrder.imageUri,
                        }}
                        style={styles.attachedThumbnailImg}
                        resizeMode="cover"
                      />
                      <View style={[styles.attachedMiniTag, { backgroundColor: '#7C3AED' }]}>
                        <Text style={styles.attachedMiniTagText}>Med</Text>
                      </View>
                    </View>
                  </View>
                ) : selectedOrder.imageUri ? (
                  <Image
                    source={{ uri: selectedOrder.imageUri }}
                    style={styles.attachedThumbnail}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.attachedThumbnailPlaceholder}>
                    <Feather name="file-text" size={16} color={Colors.tealDark} />
                  </View>
                )}

                <View style={styles.attachedCardInfo}>
                  <View style={styles.attachedCardTopRow}>
                    <Text style={styles.attachedOrderNum}>{selectedOrder.orderNumber}</Text>
                    <View
                      style={[
                        styles.attachedActiveTag,
                        selectedOrder.type === 'verification' && {
                          backgroundColor: '#F5F3FF',
                          borderColor: '#DDD6FE',
                        },
                      ]}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={11}
                        color={selectedOrder.type === 'verification' ? '#7C3AED' : Colors.tealDark}
                      />
                      <Text
                        style={[
                          styles.attachedActiveTagText,
                          selectedOrder.type === 'verification' && { color: '#7C3AED' },
                        ]}
                      >
                        {selectedOrder.type === 'verification'
                          ? `Audit: ${selectedOrder.status}`
                          : 'Consulting on Rx'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.attachedConcernText} numberOfLines={1}>
                    {selectedOrder.patientConcern ||
                      (selectedOrder.type === 'verification'
                        ? 'Dual Verification Audit'
                        : 'Prescription Analysis')}
                  </Text>
                  {selectedOrder.medicineNames && selectedOrder.medicineNames.length > 0 && (
                    <Text style={styles.attachedMedsText} numberOfLines={1}>
                      {selectedOrder.type === 'verification' ? 'Items: ' : 'Meds: '}
                      {selectedOrder.medicineNames.join(', ')}
                    </Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={styles.detachButton}
                activeOpacity={0.7}
                onPress={() => setSelectedOrder(null)}
              >
                <Feather name="x" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            /* Option to Attach from History */
            <TouchableOpacity
              style={styles.attachBtnPill}
              activeOpacity={0.8}
              onPress={() => {
                if (orders.length === 0) {
                  Alert.alert(
                    'No History Found',
                    'You have not scanned any prescriptions or verified medicines yet. Perform an analysis first to consult Dr. MediGuard about it here.',
                    [{ text: 'OK' }]
                  );
                  return;
                }
                setIsPickerVisible(true);
              }}
            >
              <View style={styles.attachPillContent}>
                <Feather name="paperclip" size={14} color={Colors.tealDark} />
                <Text style={styles.attachBtnPillText}>
                  Attach History Record (Rx / Audit)
                </Text>
              </View>
              {orders.length > 0 && (
                <View style={styles.attachCountBadge}>
                  <Text style={styles.attachCountText}>{orders.length} available</Text>
                  <Feather name="chevron-up" size={12} color={Colors.tealDark} />
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <View style={styles.inputPill}>
            <TextInput
              style={styles.textInput}
              placeholder={
                selectedOrder
                  ? `Ask about ${selectedOrder.orderNumber}...`
                  : 'Ask a medical or medication question...'
              }
              placeholderTextColor={Colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={600}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons
                name="arrow-up"
                size={20}
                color={!inputText.trim() || isLoading ? Colors.textMuted : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ================= MODAL: SELECT PRESCRIPTION FROM HISTORY ================= */}
      <Modal
        visible={isPickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <View style={styles.pickerBackdrop}>
          <SafeAreaView style={styles.pickerModalContainer}>
            <View style={styles.pickerHeader}>
              <View>
                <Text style={styles.pickerTitle}>Select from History</Text>
                <Text style={styles.pickerSubtitle}>
                  Choose a prescription to consult Dr. MediGuard about
                </Text>
              </View>
              <TouchableOpacity
                style={styles.pickerCloseBtn}
                onPress={() => setIsPickerVisible(false)}
              >
                <Feather name="x" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={orders}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.pickerListContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedOrder?.id === item.id;
                const isVerification = item.type === 'verification';
                const medThumbnail =
                  item.primaryMedicineImageUri ||
                  (item.medicineImageUris && item.medicineImageUris[0]) ||
                  item.imageUri;

                return (
                  <TouchableOpacity
                    style={[
                      styles.pickerCard,
                      isSelected && styles.pickerCardSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedOrder(item);
                      setIsPickerVisible(false);
                    }}
                  >
                    <View style={styles.pickerCardRow}>
                      {isVerification ? (
                        <View style={styles.pickerDualThumbBox}>
                          <Image
                            source={{ uri: item.imageUri }}
                            style={styles.pickerMiniThumb}
                            resizeMode="cover"
                          />
                          <Image
                            source={{ uri: medThumbnail }}
                            style={[styles.pickerMiniThumb, styles.pickerMiniThumbOverlap]}
                            resizeMode="cover"
                          />
                        </View>
                      ) : item.imageUri ? (
                        <Image
                          source={{ uri: item.imageUri }}
                          style={styles.pickerThumbnail}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.pickerThumbnailPlaceholder}>
                          <Feather name="file-text" size={20} color={Colors.tealDark} />
                        </View>
                      )}

                      <View style={styles.pickerCardTextCol}>
                        <View style={styles.pickerCardHeaderRow}>
                          <Text style={styles.pickerOrderNumber}>{item.orderNumber}</Text>
                          <View
                            style={[
                              styles.pickerTypeTag,
                              {
                                backgroundColor: isVerification ? '#F5F3FF' : '#F0FDFA',
                                borderColor: isVerification ? '#DDD6FE' : Colors.tealAccent,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.pickerTypeTagText,
                                { color: isVerification ? '#7C3AED' : Colors.tealDark },
                              ]}
                            >
                              {isVerification ? 'Dual Audit' : 'Prescription'}
                            </Text>
                          </View>
                          <Text style={styles.pickerDateText}>
                            {new Date(item.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Text>
                        </View>

                        <Text style={styles.pickerConcern} numberOfLines={1}>
                          {item.patientConcern ||
                            (isVerification ? 'Dual Verification Audit' : 'Prescription Analysis')}
                        </Text>

                        {item.medicineNames && item.medicineNames.length > 0 && (
                          <View style={styles.pickerMedsRow}>
                            {item.medicineNames.slice(0, 3).map((mName, mIdx) => (
                              <View key={mIdx} style={styles.pickerMedChip}>
                                <Text style={styles.pickerMedChipText} numberOfLines={1}>
                                  {mName}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>

                      <View style={styles.pickerSelectIcon}>
                        <Ionicons
                          name={isSelected ? 'checkmark-circle' : 'chevron-forward'}
                          size={22}
                          color={isSelected ? Colors.tealDark : Colors.textMuted}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.cardWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doctorHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.mintBg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: Colors.tealAccent,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.successGreen,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  title: {
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.textPrimary,
  },
  statusSubtitle: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.tealDark,
    marginTop: 1,
  },
  clearButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatArea: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  doctorMessageRow: {
    justifyContent: 'flex-start',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  doctorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.mintBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  doctorBubble: {
    backgroundColor: Colors.cardWhite,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: Colors.charcoal,
    borderTopRightRadius: 4,
  },
  doctorBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  doctorName: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.tealDark,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedTagText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.tealDark,
  },
  messageAttachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  messageAttachmentText: {
    color: '#A7F3D0',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
    maxWidth: '90%',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  doctorText: {
    color: Colors.textPrimary,
  },
  userText: {
    color: '#FFFFFF',
  },
  timestampText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_500Medium',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  doctorTimestamp: {
    color: Colors.textMuted,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.cardWhite,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  typingText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.textSecondary,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  suggestionChip: {
    backgroundColor: Colors.cardWhite,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  suggestionText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.charcoal,
  },

  /* Attachment Area above input */
  attachmentAreaContainer: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  attachBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  attachPillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attachBtnPillText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.tealDark,
  },
  attachCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  attachCountText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.tealDark,
  },
  attachedPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardWhite,
    borderWidth: 1.5,
    borderColor: Colors.tealAccent,
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  attachedCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  attachedThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  attachedDualThumbRow: {
    flexDirection: 'row',
    gap: 4,
  },
  attachedMiniThumbBox: {
    width: 30,
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  attachedThumbnailImg: {
    width: '100%',
    height: '100%',
  },
  attachedMiniTag: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: Colors.tealDark,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
  },
  attachedMiniTagText: {
    color: '#FFF',
    fontSize: 7,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  attachedThumbnailPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.mintBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachedCardInfo: {
    flex: 1,
    gap: 2,
  },
  attachedCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attachedOrderNum: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.textPrimary,
  },
  attachedActiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  attachedActiveTagText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.tealDark,
  },
  attachedConcernText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.textPrimary,
  },
  attachedMedsText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
  },
  detachButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  inputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 105,
    backgroundColor: Colors.canvas,
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardWhite,
    borderRadius: 26,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textPrimary,
    maxHeight: 90,
    paddingTop: 6,
    paddingBottom: 6,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#F1F5F9',
  },

  /* Modal Picker Styles */
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  pickerModalContainer: {
    backgroundColor: Colors.canvas,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '75%',
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.cardWhite,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  pickerTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.textPrimary,
  },
  pickerSubtitle: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pickerCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerListContent: {
    padding: 18,
    gap: 12,
  },
  pickerCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  pickerCardSelected: {
    borderColor: Colors.tealAccent,
    backgroundColor: '#F0FDFA',
  },
  pickerCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickerThumbnail: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  pickerDualThumbBox: {
    width: 54,
    height: 54,
    position: 'relative',
  },
  pickerMiniThumb: {
    width: 38,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  pickerMiniThumbOverlap: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: -1, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  pickerThumbnailPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: Colors.mintBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerCardTextCol: {
    flex: 1,
    gap: 2,
  },
  pickerCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerOrderNumber: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.textPrimary,
  },
  pickerTypeTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1,
  },
  pickerTypeTagText: {
    fontSize: 9,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  pickerDateText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
    marginLeft: 'auto',
  },
  pickerConcern: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.textPrimary,
  },
  pickerMedsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  pickerMedChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pickerMedChipText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.charcoal,
  },
  pickerSelectIcon: {
    paddingLeft: 6,
  },
});
