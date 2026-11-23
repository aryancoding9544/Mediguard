import { create } from 'zustand';
import { PrescriptionAnalysisResult } from '../constants/types';

interface ScanStoreState {
  capturedImageUri: string | null;
  capturedImageBase64: string | null;
  setCapturedImage: (uri: string | null, base64?: string | null) => void;

  analysisResult: PrescriptionAnalysisResult | null;
  setAnalysisResult: (result: PrescriptionAnalysisResult | null) => void;

  isAnalyzing: boolean;
  setIsAnalyzing: (loading: boolean) => void;

  error: string | null;
  setError: (err: string | null) => void;

  loadAnalysisFromOrder: (
    result: PrescriptionAnalysisResult,
    imageUri?: string | null
  ) => void;

  reset: () => void;
}

export const useScanStore = create<ScanStoreState>((set) => ({
  capturedImageUri: null,
  capturedImageBase64: null,
  setCapturedImage: (uri, base64 = null) =>
    set({ capturedImageUri: uri, capturedImageBase64: base64 }),

  analysisResult: null,
  setAnalysisResult: (result) => set({ analysisResult: result }),

  isAnalyzing: false,
  setIsAnalyzing: (loading) => set({ isAnalyzing: loading }),

  error: null,
  setError: (err) => set({ error: err }),

  loadAnalysisFromOrder: (result, imageUri = null) =>
    set({
      analysisResult: result,
      capturedImageUri: imageUri,
      capturedImageBase64: null,
      error: null,
      isAnalyzing: false,
    }),

  reset: () =>
    set({
      capturedImageUri: null,
      capturedImageBase64: null,
      analysisResult: null,
      isAnalyzing: false,
      error: null,
    }),
}));
