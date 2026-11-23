import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paths, Directory, File } from 'expo-file-system';
import {
  LocalOrder,
  PrescriptionAnalysisResult,
  VerificationComparisonResult,
} from '../constants/types';

const STORAGE_KEY = '@mediguard_local_orders_v1';

/**
 * Copies or saves an image into the app's persistent document directory
 * so it remains permanently available offline and survives OS cache sweeps.
 */
async function persistImageLocally(
  sourceUri: string,
  base64?: string | null
): Promise<string> {
  try {
    if (Paths && Paths.document) {
      const ordersDir = new Directory(Paths.document, 'orders_images');
      if (!ordersDir.exists) {
        ordersDir.create({ idempotent: true });
      }

      const fileName = `rx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;
      const targetFile = new File(ordersDir, fileName);

      if (
        sourceUri.startsWith('file://') ||
        sourceUri.startsWith('content://') ||
        sourceUri.startsWith('/')
      ) {
        const sourceFile = new File(sourceUri);
        if (sourceFile.exists) {
          sourceFile.copy(targetFile);
          console.log('[OrdersStore] Copied image to persistent storage:', targetFile.uri);
          return targetFile.uri;
        }
      }

      if (base64) {
        if (!targetFile.exists) {
          targetFile.create({ intermediates: true });
        }
        await targetFile.write(base64);
        console.log('[OrdersStore] Wrote image to persistent storage:', targetFile.uri);
        return targetFile.uri;
      }
    }
  } catch (err) {
    console.warn('[OrdersStore] Error persisting image locally, fallback to URI:', err);
  }

  // Fallback for web or if local copy is not supported
  if (base64 && !sourceUri.startsWith('file://') && !sourceUri.startsWith('http')) {
    return `data:image/jpeg;base64,${base64}`;
  }
  return sourceUri;
}

interface OrdersStoreState {
  orders: LocalOrder[];
  isLoading: boolean;
  selectedOrderForChat: LocalOrder | null;
  setSelectedOrderForChat: (order: LocalOrder | null) => void;
  loadOrders: () => Promise<void>;

  addPrescriptionOrder: (params: {
    imageUri: string;
    imageBase64?: string | null;
    result: PrescriptionAnalysisResult;
  }) => Promise<LocalOrder>;

  addVerificationOrder: (params: {
    prescriptionImageUri: string;
    prescriptionImageBase64?: string | null;
    medicineImages: Array<{ uri: string; base64?: string | null; name?: string }>;
    result: VerificationComparisonResult;
  }) => Promise<LocalOrder>;

  deleteOrder: (id: string) => Promise<void>;
  clearAllOrders: () => Promise<void>;
}

export const useOrdersStore = create<OrdersStoreState>((set, get) => ({
  orders: [],
  isLoading: false,
  selectedOrderForChat: null,
  setSelectedOrderForChat: (order) => set({ selectedOrderForChat: order }),

  loadOrders: async () => {
    set({ isLoading: true });
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: LocalOrder[] = JSON.parse(raw);
        set({ orders: Array.isArray(parsed) ? parsed : [] });
      }
    } catch (err) {
      console.error('[OrdersStore] Error loading local orders:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addPrescriptionOrder: async ({ imageUri, imageBase64, result }) => {
    set({ isLoading: true });
    try {
      // 1. Persist image to persistent local storage
      const persistentUri = await persistImageLocally(imageUri, imageBase64);

      // 2. Generate clean order number
      const orderNumber = `RX-${Math.floor(1000 + Math.random() * 9000)}`;

      // 3. Extract key details
      const medicineNames =
        result.identified_medicines?.map((m) => m.name).filter(Boolean) || [];

      const newOrder: LocalOrder = {
        id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        orderNumber,
        createdAt: new Date().toISOString(),
        type: 'prescription_analysis',
        imageUri: persistentUri,
        patientConcern: result.patient_concern || 'Prescription Analysis',
        confidenceScore: result.confidence_score || 0.9,
        status: result.status || 'success',
        identifiedMedicines: result.identified_medicines || [],
        analysisResult: result,
        medicineNames,
        totalMedicines: medicineNames.length,
        batchNumber: result.batch_verification?.batch_number,
        recallStatus: result.batch_verification?.recall_status,
      };

      const updated = [newOrder, ...get().orders];
      set({ orders: updated });

      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      console.log(`[OrdersStore] Stored prescription analytics locally: ${newOrder.id} (${newOrder.orderNumber})`);
      return newOrder;
    } catch (err) {
      console.error('[OrdersStore] Error adding prescription order:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  addVerificationOrder: async ({
    prescriptionImageUri,
    prescriptionImageBase64,
    medicineImages,
    result,
  }) => {
    set({ isLoading: true });
    try {
      // 1. Persist prescription image locally
      const persistentRxUri = await persistImageLocally(
        prescriptionImageUri,
        prescriptionImageBase64
      );

      // 2. Persist medicine packaging images locally
      const persistentMedUris = await Promise.all(
        (medicineImages || []).map((med) => persistImageLocally(med.uri, med.base64))
      );

      const orderNumber = `VF-${Math.floor(1000 + Math.random() * 9000)}`;

      // 3. Extract medicine names from comparison items or packaging info
      const comparisonNames =
        result.comparison_items
          ?.map((item) => item.purchased_product_name || item.prescribed_name)
          .filter(Boolean) || [];

      const fallbackBrand = result.packaging_info?.brand_name
        ? [result.packaging_info.brand_name]
        : [];

      const medicineNames =
        comparisonNames.length > 0 ? Array.from(new Set(comparisonNames)) : fallbackBrand;

      const newOrder: LocalOrder = {
        id: `ord_vf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        orderNumber,
        createdAt: new Date().toISOString(),
        type: 'verification',
        imageUri: persistentRxUri,
        medicineImageUris: persistentMedUris,
        primaryMedicineImageUri: persistentMedUris[0] || undefined,
        patientConcern:
          result.summary ||
          result.packaging_info?.generic_name_or_composition ||
          'Dual Verification Audit',
        confidenceScore: result.confidence_score || 0.88,
        status: result.status,
        verificationResult: result,
        medicineNames,
        totalMedicines: medicineNames.length,
        batchNumber: result.packaging_info?.batch_number,
        recallStatus: result.packaging_info?.is_expired ? 'EXPIRED' : 'ACTIVE',
      };

      const updated = [newOrder, ...get().orders];
      set({ orders: updated });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      console.log(`[OrdersStore] Stored verification audit locally: ${newOrder.id} (${newOrder.orderNumber})`);
      return newOrder;
    } catch (err) {
      console.error('[OrdersStore] Error adding verification order:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteOrder: async (id: string) => {
    try {
      const target = get().orders.find((o) => o.id === id);
      const updated = get().orders.filter((o) => o.id !== id);
      set({ orders: updated });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Attempt to clean up local files
      const urisToDelete = [
        target?.imageUri,
        ...(target?.medicineImageUris || []),
      ].filter(Boolean) as string[];

      for (const uri of urisToDelete) {
        try {
          if (uri.startsWith('file://') || uri.startsWith('/')) {
            const file = new File(uri);
            if (file.exists) {
              file.delete();
            }
          }
        } catch (e) {
          // ignore cleanup errors
        }
      }
    } catch (err) {
      console.error('[OrdersStore] Error deleting order:', err);
    }
  },

  clearAllOrders: async () => {
    try {
      set({ orders: [] });
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('[OrdersStore] Error clearing orders:', err);
    }
  },
}));

// Automatically load existing orders into store upon import
useOrdersStore.getState().loadOrders();
