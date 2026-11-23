export interface IdentifiedMedicine {
  id?: string;
  name: string;
  generic_name: string;
  dosage: string;
  confidence: number;
  is_uncertain: boolean;
  therapeutic_class?: string;
  primary_uses: string;
  warnings: string;
  side_effects: string[];
  price?: number;
  priceFormatted?: string;
}

export interface PrescriptionAnalysisResult {
  analysis_id: string;
  patient_concern: string;
  status: 'success' | 'partial' | 'error';
  confidence_score: number;
  extracted_raw_text: string;
  identified_medicines: IdentifiedMedicine[];
  uncertain_segments: string[];
  safety_warnings: string[];
  batch_verification?: {
    batch_number: string;
    recall_status: 'CLEAR' | 'RECALLED' | 'UNKNOWN';
    expiry_date: string;
    is_expired: boolean;
    database: string;
  };
}

// ----------------- Dual Verification & Authenticity Types -----------------

export interface MedicinePackagingInfo {
  brand_name: string;
  generic_name_or_composition: string;
  manufacturer: string;
  batch_number: string;
  expiry_date: string;
  mfg_date: string;
  detected_codes: string[];
  authenticity_indicators: string[];
  is_expired: boolean;
  authenticity_status: 'GENUINE_INDICATORS' | 'SUSPICIOUS' | 'UNCONFIRMED' | string;
  authenticity_notes: string;
}

export interface MedicineComparisonItem {
  prescribed_name: string;
  prescribed_dosage: string;
  purchased_product_name: string;
  purchased_composition: string;
  is_exact_match: boolean;
  is_generic_equivalent: boolean;
  is_mismatch: boolean;
  strength_match?: boolean;
  dosage_form_match?: boolean;
  status: 'MATCH' | 'GENERIC_SUBSTITUTE' | 'MISMATCH' | 'CAUTION' | string;
  explanation: string;
}

export interface VerificationComparisonResult {
  status: 'MATCH' | 'PARTIAL_MATCH' | 'MISMATCH' | 'UNCERTAIN';
  confidence_score: number;
  summary: string;
  packaging_info: MedicinePackagingInfo;
  comparison_items: MedicineComparisonItem[];
  safety_alerts: string[];
  guidance: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

// ----------------- Local Orders & Analytics Types -----------------

export interface LocalOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  type: 'prescription_analysis' | 'verification';
  imageUri: string;
  imageBase64?: string | null;
  medicineImageUris?: string[];
  primaryMedicineImageUri?: string;
  patientConcern?: string;
  confidenceScore: number;
  status: string;
  identifiedMedicines?: IdentifiedMedicine[];
  analysisResult?: PrescriptionAnalysisResult;
  verificationResult?: VerificationComparisonResult;
  medicineNames: string[];
  totalMedicines: number;
  batchNumber?: string;
  recallStatus?: string;
}

