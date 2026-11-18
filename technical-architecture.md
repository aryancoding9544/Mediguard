# MEDIGUARD — Technical Architecture & Implementation Specification

> **Platform:** Mobile Native (iOS & Android)  
> **Core Framework:** React Native with Expo (SDK 51+)  
> **Language:** TypeScript  
> **Backend Integration:** Python FastAPI (AI OCR, Batch Registry, Medicine Comparison)  
> **Companion Document:** [design.md](file:///c:/Users/User/Desktop/coding%20files/mediguard/design.md) (UI/UX & Design System)

---

## 1. Architecture Overview

MEDIGUARD's mobile application is built with **React Native** and the **Expo** ecosystem to provide a 60fps native experience on iOS and Android. The architecture is modular, separating UI presentation, device hardware access (Camera, Haptics), client state management, and backend communication.

```
+-----------------------------------------------------------------+
|                       EXPO MOBILE CLIENT                        |
|                                                                 |
|   [ Presentation Layer ]                                        |
|   - Expo Router (File-based navigation & Tab Dock)              |
|   - NativeWind / StyleSheet (Tailwind token system)             |
|   - Custom UI Components (Cards, Steppers, SVG Progress Dials)  |
|                                                                 |
|   [ Device Hardware & Media Layer ]                             |
|   - expo-camera (Viewfinder & shutter for prescriptions)        |
|   - expo-image-picker (Prescription & packaging photo upload)   |
|   - expo-haptics (Tactile interaction feedback)                 |
|   - expo-font (Inter, Plus Jakarta Sans, Caveat script)         |
|                                                                 |
|   [ Service & State Layer ]                                     |
|   - API Service (Axios / Fetch with multipart upload)           |
|   - Local Store (Zustand / React Context for analysis state)    |
+-----------------------------------------------------------------+
                                |
                   REST API / Multipart Upload
                                |
                                v
+-----------------------------------------------------------------+
|                    FASTAPI PYTHON BACKEND                       |
|                                                                 |
|   /api/v1/prescriptions/analyze  --> OCR & Handwriting Model    |
|   /api/v1/medicines/info         --> Pharmacological Database   |
|   /api/v1/verification/compare   --> Rx vs Purchased Matcher    |
|   /api/v1/batch/verify           --> Sample Recall & Batch DB   |
+-----------------------------------------------------------------+
```

---

## 2. Tech Stack & Dependencies

### 2.1 Core Runtime & UI Packages

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "expo-status-bar": "~1.12.1",
    "react": "18.2.0",
    "react-native": "0.74.1",
    "react-native-safe-area-context": "4.10.1",
    "react-native-screens": "~3.31.1",
    
    "nativewind": "^4.0.1",
    "tailwindcss": "^3.4.0",
    
    "expo-camera": "~15.0.0",
    "expo-image-picker": "~15.0.0",
    "expo-haptics": "~13.0.0",
    "expo-font": "~12.0.0",
    "@expo-google-fonts/plus-jakarta-sans": "^0.2.3",
    "@expo-google-fonts/caveat": "^0.2.3",
    
    "lucide-react-native": "^0.378.0",
    "@expo/vector-icons": "^14.0.0",
    "react-native-svg": "15.2.0",
    "react-native-reanimated": "~3.10.1",
    "react-native-gesture-handler": "~2.16.1",
    
    "zustand": "^4.5.2",
    "axios": "^1.7.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/react": "~18.2.79",
    "typescript": "~5.3.3"
  }
}
```

---

## 3. Directory & File Structure (Expo Router)

```text
mediguard-mobile/
├── app/
│   ├── _layout.tsx                     # Root Stack Layout (Fonts, Theme, Toast)
│   ├── (tabs)/                         # Tab Group
│   │   ├── _layout.tsx                 # Floating Tab Bar with Squircle Scan Button
│   │   ├── index.tsx                   # Screen 1: Dashboard / Home
│   │   ├── orders.tsx                  # Orders & History List
│   │   ├── scan-tab.tsx                # Interceptor tab linking to /scan modal
│   │   ├── chat.tsx                    # AI Chat Assistant
│   │   └── profile.tsx                 # Profile & Health Preferences
│   ├── scan/
│   │   ├── index.tsx                   # Screen 2: Prescription Scanner (Viewfinder)
│   │   └── result.tsx                  # Extraction & Confidence Report Screen
│   ├── product/
│   │   └── [id].tsx                    # Screen 3: Medicine Details & Batch Verify
│   └── compare/
│       └── index.tsx                   # Rx vs Purchased Medicine Side-by-Side Screen
├── components/
│   ├── common/
│   │   ├── AppHeader.tsx               # Reusable header with back & options buttons
│   │   ├── CircularButton.tsx          # Pill/Circle button with icon
│   │   └── Badge.tsx                   # 30X, MATCH, MISMATCH badges
│   ├── dashboard/
│   │   ├── HeaderProfile.tsx           # Avatar, location, notification bell
│   │   ├── QuickActionGrid.tsx         # 2x2 grid (Upload, Order, Pharmacy, Reminder)
│   │   └── MedicineCarousel.tsx        # Horizontal Snap Carousel with peek cards
│   ├── scanner/
│   │   ├── ViewfinderOverlay.tsx       # Teal corner brackets & scan guide
│   │   ├── ProgressDial.tsx            # 75% circular SVG progress indicator
│   │   ├── CameraToolbar.tsx           # Gallery, Shutter, and Flash toggle
│   │   └── HandwritingPreview.tsx      # Caveat font doctor prescription simulated card
│   └── product/
│       ├── ProductGallery.tsx          # Swiping card showcase with rounded corners
│       ├── QuantityStepper.tsx         # [- 2 +] pill stepper
│       └── StickyCTA.tsx               # Full-width "Buy Now" / "Verify" action bar
├── constants/
│   ├── Colors.ts                       # Hex tokens for NativeWind / StyleSheet
│   ├── MockData.ts                     # Demonstration medicine & prescription records
│   └── Layout.ts                       # Screen dimensions, hitSlop values
├── services/
│   ├── api.ts                          # Axios client configured with base URL
│   ├── prescriptionService.ts          # Multipart prescription upload & OCR
│   ├── comparisonService.ts            # Comparison engine integration
│   └── batchService.ts                 # Registry & recall lookup
├── store/
│   └── useAppStore.ts                  # Zustand store for scan history & cart
├── tailwind.config.js                  # NativeWind configuration
├── tsconfig.json
└── app.json                            # Expo configuration (permissions, scheme)
```

---

## 4. Hardware & Permissions Configuration

### 4.1 `app.json` Permissions Configuration

```json
{
  "expo": {
    "name": "MediGuard",
    "slug": "mediguard",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "MediGuard requires camera access to scan doctor prescriptions and medicine packaging."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "MediGuard needs access to your photos to upload prescription images from your library."
        }
      ]
    ],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.mediguard.app"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#F8F9FA"
      },
      "package": "com.mediguard.app",
      "permissions": ["CAMERA", "READ_EXTERNAL_STORAGE"]
    }
  }
}
```

---

## 5. Core Component Implementations

### 5.1 Color Tokens (`constants/Colors.ts`)

```typescript
export const Colors = {
  // Backgrounds & Surfaces
  canvas: '#F8F9FA',
  cardWhite: '#FFFFFF',
  
  // Pastel Theme Accents
  mintBg: '#D5F5F6',
  pinkBg: '#FED4DD',
  tealAccent: '#2DD4BF',
  tealDark: '#0D9488',
  
  // Typography & Neutrals
  charcoal: '#111827',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  borderLight: '#E2E8F0',
  
  // Feedback
  alertRed: '#EF4444',
  successGreen: '#10B981',
  warningAmber: '#F59E0B',
};
```

---

### 5.2 Custom Floating Bottom Tab Bar (`app/(tabs)/_layout.tsx`)

Implements the floating bottom dock with the center elevated scan squircle button.

```tsx
import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarActiveTintColor: Colors.charcoal,
        tabBarInactiveTintColor: Colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <Feather name="file-text" size={20} color={color} />,
        }}
      />

      {/* Middle Tab: Elevated Black Squircle Scan Button */}
      <Tabs.Screen
        name="scan-tab"
        options={{
          title: '',
          tabBarButton: () => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/scan');
              }}
              style={styles.scanSquircle}
            >
              <Feather name="maximize" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI Chat',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.chatIconBadge}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 8,
    borderTopWidth: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: -2,
  },
  scanSquircle: {
    backgroundColor: Colors.charcoal,
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  chatIconBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

---

### 5.3 Circular Progress Dial Component (`components/scanner/ProgressDial.tsx`)

Renders the `75%` circular SVG progress dial from Screen 2 with an animated stroke.

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../../constants/Colors';

interface ProgressDialProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export const ProgressDial: React.FC<ProgressDialProps> = ({
  percentage = 75,
  size = 66,
  strokeWidth = 3,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Dark Circle Fill & Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1E293B"
          strokeWidth={strokeWidth}
          fill={Colors.charcoal}
        />
        {/* Progress Arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.tealAccent}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={styles.text}>{percentage}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
```

---

### 5.4 Quantity Stepper Component (`components/product/QuantityStepper.tsx`)

Implements the pill-shaped `[- 2 +]` stepper from Screen 3.

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
}) => {
  return (
    <View style={styles.stepperContainer}>
      <TouchableOpacity
        onPress={() => {
          Haptics.selectionAsync();
          onDecrement();
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.stepButton}
      >
        <Text style={styles.minusText}>−</Text>
      </TouchableOpacity>

      <Text style={styles.quantityText}>{quantity}</Text>

      <TouchableOpacity
        onPress={() => {
          Haptics.selectionAsync();
          onIncrement();
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.plusButtonCircle}
      >
        <Text style={styles.plusText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 14,
  },
  stepButton: {
    paddingHorizontal: 4,
  },
  minusText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  plusButtonCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
});
```

---

## 6. Backend Integration Contracts (FastAPI)

### 6.1 Prescription OCR Analysis Endpoint

* **Endpoint:** `POST /api/v1/prescriptions/analyze`
* **Content-Type:** `multipart/form-data`
* **Request:**
  ```text
  file: [binary image of handwritten prescription]
  ```
* **Response:**
  ```json
  {
    "status": "success",
    "analysis_id": "rx_84920482",
    "extracted_text": "Patient's concern: Headache\nRecommendation: Yakapsule! 3x a day!",
    "identified_medicines": [
      {
        "name": "Yakapsule",
        "generic_name": "Paracetamol / Acetaminophen 500mg",
        "confidence": 0.88,
        "is_uncertain": false,
        "dosage": "3x a day",
        "primary_uses": "Relief of mild to moderate pain and fever",
        "warnings": "Do not exceed 4000mg in 24 hours. Avoid concurrent alcohol intake.",
        "side_effects": ["Nausea", "Rare allergic reactions"]
      }
    ],
    "uncertain_segments": []
  }
  ```

---

### 6.2 Prescription vs. Purchased Medicine Comparison Endpoint

* **Endpoint:** `POST /api/v1/verification/compare`
* **Content-Type:** `multipart/form-data`
* **Request:**
  ```text
  prescription_file: [binary image of prescription]
  product_file: [binary image of purchased medicine packaging]
  ```
* **Response:**
  ```json
  {
    "status": "success",
    "verification_result": "MATCH", // MATCH | PARTIAL_MATCH | MISMATCH | UNABLE_TO_VERIFY
    "confidence_score": 0.94,
    "comparison_details": {
      "prescribed_medicine": "Yakapsule (Paracetamol 500mg)",
      "prescribed_dosage": "3x a day",
      "purchased_product": "Yakapsule 500mg Capsules",
      "purchased_active_ingredient": "Paracetamol 500mg",
      "strength_match": true,
      "dosage_form_match": true
    },
    "batch_details": {
      "batch_number": "YK-98421",
      "expiry_date": "2027-08-31",
      "is_expired": false,
      "recall_status": "CLEAR"
    }
  }
  ```

---

## 7. Development & Run Commands

```bash
# 1. Initialize Expo Project with Router
npx create-expo-app@latest mediguard-mobile --template blank-typescript

# 2. Install Navigation & Router
npx expo install expo-router react-native-safe-area-context react-native-screens expo-status-bar

# 3. Install Camera, Media & Sensory APIs
npx expo install expo-camera expo-image-picker expo-haptics expo-font

# 4. Install Visual, SVG & Animation Libraries
npx expo install react-native-svg react-native-reanimated react-native-gesture-handler @expo/vector-icons lucide-react-native

# 5. Start Development Server
npx expo start
```

---
*Maintained as the definitive technical implementation guide for MEDIGUARD mobile.*
