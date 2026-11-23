import { create } from 'zustand';
import { VerificationComparisonResult } from '../constants/types';

export interface UploadedImageItem {
  id: string;
  uri: string;
  base64?: string | null;
  name?: string;
}

interface VerifyStoreState {
  // Prescription image (single)
  prescriptionImage: UploadedImageItem | null;
  setPrescriptionImage: (image: UploadedImageItem | null) => void;

  // Medicine images (multiple)
  medicineImages: UploadedImageItem[];
  addMedicineImage: (image: UploadedImageItem) => void;
  addMedicineImages: (images: UploadedImageItem[]) => void;
  removeMedicineImage: (id: string) => void;
  clearMedicineImages: () => void;

  // Verification state & results
  isVerifying: boolean;
  setIsVerifying: (loading: boolean) => void;

  verificationResult: VerificationComparisonResult | null;
  setVerificationResult: (result: VerificationComparisonResult | null) => void;

  error: string | null;
  setError: (err: string | null) => void;

  reset: () => void;
}

export const useVerifyStore = create<VerifyStoreState>((set) => ({
  prescriptionImage: null,
  setPrescriptionImage: (image) => set({ prescriptionImage: image }),

  medicineImages: [],
  addMedicineImage: (image) =>
    set((state) => ({
      medicineImages: [...state.medicineImages, image],
    })),
  addMedicineImages: (images) =>
    set((state) => ({
      medicineImages: [...state.medicineImages, ...images],
    })),
  removeMedicineImage: (id) =>
    set((state) => ({
      medicineImages: state.medicineImages.filter((img) => img.id !== id),
    })),
  clearMedicineImages: () => set({ medicineImages: [] }),

  isVerifying: false,
  setIsVerifying: (loading) => set({ isVerifying: loading }),

  verificationResult: null,
  setVerificationResult: (result) => set({ verificationResult: result }),

  error: null,
  setError: (err) => set({ error: err }),

  reset: () =>
    set({
      prescriptionImage: null,
      medicineImages: [],
      isVerifying: false,
      verificationResult: null,
      error: null,
    }),
}));
