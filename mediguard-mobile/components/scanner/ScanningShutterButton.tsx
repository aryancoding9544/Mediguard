import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';

interface ScanningShutterButtonProps {
  onScanComplete?: () => void;
  onScanProgress?: (progress: number) => void;
  onBeforeScan?: () => boolean;
  size?: number;
}

export const ScanningShutterButton: React.FC<ScanningShutterButtonProps> = ({
  onScanComplete,
  onScanProgress,
  onBeforeScan,
  size = 76,
}) => {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [percentage, setPercentage] = useState(0);

  // Animations
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  // Running circular motion animation for the glowing border
  useEffect(() => {
    let rotationLoop: Animated.CompositeAnimation | null = null;
    let pulseLoop: Animated.CompositeAnimation | null = null;

    if (scanState === 'done') {
      // Glow fade-in
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();

      // Continuous circular running motion
      rotateAnim.setValue(0);
      rotationLoop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotationLoop.start();

      // Gentle breathing pulse
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 650,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 650,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
    } else {
      glowOpacity.setValue(0);
      rotateAnim.setValue(0);
      pulseAnim.setValue(1);
    }

    return () => {
      rotationLoop?.stop();
      pulseLoop?.stop();
    };
  }, [scanState]);

  const triggerHaptic = async (type: 'impact' | 'success') => {
    try {
      if (type === 'impact') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      // Gracefully ignore on emulators or devices without haptics
    }
  };

  const handleStartScan = () => {
    if (scanState === 'scanning') return;

    if (scanState === 'done') {
      // If already done, clicking again navigates immediately
      onScanComplete?.();
      return;
    }

    if (onBeforeScan && !onBeforeScan()) {
      return;
    }

    // Trigger haptics safely
    triggerHaptic('impact');

    // Button press scale feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setScanState('scanning');
    setPercentage(0);

    // Realistic scanning progress steps: 1-5-6-10-20-50-66-88-100
    const progressSteps = [
      { target: 6, delay: 180 },
      { target: 14, delay: 350 },
      { target: 28, delay: 600 },
      { target: 46, delay: 900 },
      { target: 62, delay: 1200 },
      { target: 78, delay: 1500 },
      { target: 91, delay: 1800 },
      { target: 100, delay: 2150 },
    ];

    let startTime = Date.now();
    const duration = 2200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);

      // Smooth step calculation
      let currentVal = Math.floor(progressRatio * 100);

      // Snap through recognizable milestones
      if (progressRatio < 0.2) currentVal = Math.floor(progressRatio * 50);
      else if (progressRatio < 0.6) currentVal = Math.floor(10 + progressRatio * 75);
      else currentVal = Math.min(100, Math.floor(progressRatio * 100));

      setPercentage(currentVal);
      onScanProgress?.(currentVal);

      if (progressRatio >= 1) {
        clearInterval(interval);
        setPercentage(100);
        onScanProgress?.(100);
        setScanState('done');

        triggerHaptic('success');

        // Allow user to see and enjoy the circular blue running glow, then transition to result
        setTimeout(() => {
          onScanComplete?.();
        }, 1400);
      }
    }, 40);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
          },
        ]}
      >
        {/* Glowing circular runner light effect when done */}
        {scanState === 'done' && (
          <Animated.View
            style={[
              styles.glowRunnerWrapper,
              {
                width: size + 16,
                height: size + 16,
                opacity: glowOpacity,
                transform: [{ rotate: spin }],
              },
            ]}
            pointerEvents="none"
          >
            <Svg width={size + 16} height={size + 16} style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="blueGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#00F0FF" stopOpacity="1" />
                  <Stop offset="40%" stopColor="#38BDF8" stopOpacity="0.8" />
                  <Stop offset="80%" stopColor="#2563EB" stopOpacity="0.1" />
                  <Stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Circle
                cx={(size + 16) / 2}
                cy={(size + 16) / 2}
                r={(size + 8) / 2}
                stroke="url(#blueGlowGrad)"
                strokeWidth={5}
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={`${circumference * 0.45} ${circumference * 0.55}`}
              />
            </Svg>
          </Animated.View>
        )}

        {/* Outer Aura Glow */}
        {scanState === 'done' && (
          <Animated.View
            style={[
              styles.outerAuraGlow,
              {
                width: size + 10,
                height: size + 10,
                borderRadius: (size + 10) / 2,
                opacity: glowOpacity,
              },
            ]}
          />
        )}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleStartScan}
          style={[
            styles.buttonSurface,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          {/* Circular SVG Track & Progress Arc */}
          <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
            {/* Background track circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#1E293B"
              strokeWidth={strokeWidth}
              fill={Colors.charcoal}
            />

            {/* Dynamic Progress Arc */}
            {scanState !== 'idle' && (
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={scanState === 'done' ? '#38BDF8' : Colors.tealAccent}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${size / 2}, ${size / 2}`}
              />
            )}
          </Svg>

          {/* Button Content */}
          <View style={styles.centerContent}>
            {scanState === 'idle' && (
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={30} color="#FFFFFF" />
              </View>
            )}

            {scanState === 'scanning' && (
              <View style={styles.percentageContainer}>
                <Text style={styles.percentageNumber}>{percentage}</Text>
                <Text style={styles.percentageSymbol}>%</Text>
              </View>
            )}

            {scanState === 'done' && (
              <View style={styles.doneContainer}>
                <Feather name="check" size={28} color="#38BDF8" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSurface: {
    backgroundColor: Colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  percentageNumber: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  percentageSymbol: {
    color: Colors.tealAccent,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    marginLeft: 1,
  },
  doneContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRunnerWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  outerAuraGlow: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#38BDF8',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 14,
    elevation: 8,
  },
});
