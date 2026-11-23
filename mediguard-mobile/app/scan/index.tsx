import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { ScanningShutterButton } from '../../components/scanner/ScanningShutterButton';
import { useScanStore } from '../../store/useScanStore';
import { useOrdersStore } from '../../store/useOrdersStore';
import { analyzePrescriptionImage } from '../../services/api';

export default function ScanScreen() {
  const router = useRouter();
  const { addPrescriptionOrder } = useOrdersStore();
  const {
    capturedImageUri,
    capturedImageBase64,
    setCapturedImage,
    setAnalysisResult,
    isAnalyzing,
    setIsAnalyzing,
    setError,
  } = useScanStore();

  const [scanProgress, setScanProgress] = useState(0);
  const [isScanningAnim, setIsScanningAnim] = useState(false);
  const laserAnim = useRef(new Animated.Value(0)).current;

  // Gallery image picker with base64 enabled
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
        base64: true, // Native base64 extraction directly from ImagePicker
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        let b64 = asset.base64 || null;
        if (!b64 && asset.uri) {
          try {
            const f = new File(asset.uri);
            b64 = await f.base64();
          } catch (e) {}
        }
        setCapturedImage(asset.uri, b64);
        setScanProgress(0);
        setIsScanningAnim(false);
      }
    } catch (error) {
      console.log('Error selecting image:', error);
    }
  };

  // Camera capture with base64 enabled
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Camera permission is required to take photos of prescriptions.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.9,
        base64: true, // Native base64 extraction directly from ImagePicker
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        let b64 = asset.base64 || null;
        if (!b64 && asset.uri) {
          try {
            const f = new File(asset.uri);
            b64 = await f.base64();
          } catch (e) {}
        }
        setCapturedImage(asset.uri, b64);
        setScanProgress(0);
        setIsScanningAnim(false);
      }
    } catch (error) {
      console.log('Error capturing photo:', error);
    }
  };

  // Laser scanning animation
  useEffect(() => {
    let laserLoop: Animated.CompositeAnimation | null = null;
    if (isScanningAnim && scanProgress < 100) {
      laserAnim.setValue(0);
      laserLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      laserLoop.start();
    } else {
      laserAnim.setValue(0);
    }

    return () => {
      laserLoop?.stop();
    };
  }, [isScanningAnim, scanProgress < 100]);

  // Dynamic feedback message during processing
  const getStatusMessage = () => {
    if (isAnalyzing) {
      return 'Sending prescription to Gemini Vision OCR model...';
    }
    if (!capturedImageUri) {
      return 'Upload or capture a doctor prescription to analyze';
    }
    if (scanProgress === 0) {
      return 'Prescription loaded. Tap camera shutter to scan & analyze';
    }
    if (scanProgress < 35) {
      return 'Enhancing contrast and detecting handwritten blocks...';
    }
    if (scanProgress < 75) {
      return 'Running Gemini Medical Vision OCR on prescription...';
    }
    if (scanProgress < 100) {
      return 'Checking drug safety & batch database...';
    }
    return 'Analysis Complete! Loading verification report...';
  };

  const handleScanProgress = (progress: number) => {
    setScanProgress(progress);
    if (progress > 0 && progress < 100) {
      setIsScanningAnim(true);
    } else if (progress >= 100) {
      setIsScanningAnim(false);
    }
  };

  // Called when shutter completes animation — sends image to real API
  const handleScanComplete = async () => {
    if (!capturedImageUri) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzePrescriptionImage(
        capturedImageUri,
        capturedImageBase64
      );
      setAnalysisResult(result);

      // Automatically store in Orders locally with all analytics details & image
      try {
        await addPrescriptionOrder({
          imageUri: capturedImageUri,
          imageBase64: capturedImageBase64,
          result,
        });
      } catch (saveErr) {
        console.warn('[ScanScreen] Error saving local order:', saveErr);
      }

      setIsAnalyzing(false);
      router.push('/scan/result');
    } catch (err: any) {
      setIsAnalyzing(false);
      const msg = err?.message || 'Failed to analyze prescription';
      setError(msg);
      Alert.alert(
        'Analysis Notice',
        `Backend connection error: ${msg}\n\nEnsure FastAPI backend is running.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleBeforeScan = () => {
    if (!capturedImageUri) {
      pickImage();
      return false;
    }
    return true;
  };

  const laserTranslateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 280],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Feather name="chevron-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MediGuard OCR</Text>
        <TouchableOpacity
          style={styles.circleButton}
          activeOpacity={0.7}
          onPress={takePhoto}
        >
          <Feather name="camera" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Prescription Viewfinder */}
      <View style={styles.viewfinderContainer}>
        <View style={styles.viewfinder}>
          {/* Corner brackets */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {/* Animated laser scan beam */}
          {isScanningAnim && (
            <Animated.View
              style={[
                styles.laserBeam,
                {
                  transform: [{ translateY: laserTranslateY }],
                },
              ]}
            >
              <View style={styles.laserCore} />
              <View style={styles.laserAura} />
            </Animated.View>
          )}

          {/* Uploaded Image or Upload Placeholder */}
          {capturedImageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: capturedImageUri }}
                style={styles.uploadedImage}
                resizeMode="contain"
              />
              <TouchableOpacity
                style={styles.changeImageBadge}
                activeOpacity={0.8}
                onPress={pickImage}
              >
                <Feather name="refresh-cw" size={13} color="#FFFFFF" />
                <Text style={styles.changeImageText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadPromptContainer}
              activeOpacity={0.7}
              onPress={pickImage}
            >
              <View style={styles.uploadIconCircle}>
                <Feather name="upload-cloud" size={36} color={Colors.tealDark} />
              </View>
              <Text style={styles.uploadTitle}>Upload Prescription</Text>
              <Text style={styles.uploadSubtitle}>
                Tap here to pick your doctor's prescription from device photos or use camera
              </Text>
              <View style={styles.uploadButtonPill}>
                <Feather name="image" size={16} color={Colors.charcoal} />
                <Text style={styles.uploadButtonPillText}>Select Image</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Dynamic Status Text */}
      <View style={styles.statusBox}>
        {isAnalyzing && (
          <ActivityIndicator
            size="small"
            color={Colors.tealAccent}
            style={{ marginBottom: 6 }}
          />
        )}
        <Text style={styles.statusText}>{getStatusMessage()}</Text>
      </View>

      {/* Camera toolbar with shutter button */}
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.toolButton}
          activeOpacity={0.7}
          onPress={pickImage}
        >
          <Feather name="image" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <ScanningShutterButton
          onBeforeScan={handleBeforeScan}
          onScanProgress={handleScanProgress}
          onScanComplete={handleScanComplete}
          size={76}
        />

        <TouchableOpacity
          style={styles.toolButton}
          activeOpacity={0.7}
          onPress={takePhoto}
        >
          <Feather name="camera" size={24} color={Colors.textPrimary} />
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
  viewfinderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  viewfinder: {
    width: '100%',
    aspectRatio: 0.88,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: Colors.tealAccent,
    zIndex: 10,
  },
  topLeft: {
    top: 14,
    left: 14,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 14,
    right: 14,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 14,
    left: 14,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 14,
    right: 14,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 10,
  },
  laserBeam: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 20,
    pointerEvents: 'none',
  },
  laserCore: {
    height: 3,
    backgroundColor: Colors.tealAccent,
    borderRadius: 2,
    shadowColor: Colors.tealAccent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },
  laserAura: {
    height: 24,
    marginTop: -12,
    backgroundColor: 'rgba(78, 222, 196, 0.18)',
    borderRadius: 12,
  },
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  changeImageBadge: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(26, 29, 31, 0.82)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    zIndex: 15,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  uploadPromptContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  uploadIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.mintBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  uploadSubtitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  uploadButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  uploadButtonPillText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.charcoal,
  },
  statusBox: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginVertical: 14,
  },
  statusText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    paddingBottom: 20,
    paddingTop: 8,
  },
  toolButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.cardWhite,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
});
