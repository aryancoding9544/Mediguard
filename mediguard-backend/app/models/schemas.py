from pydantic import BaseModel, Field
from typing import List, Optional

class IdentifiedMedicineSchema(BaseModel):
    name: str = Field(description="Commercial brand name or generic name identified on the prescription")
    generic_name: Optional[str] = Field(default="", description="Active pharmaceutical ingredient (API)")
    dosage: Optional[str] = Field(default="", description="Prescribed dose and frequency (e.g., 500mg, 1 tablet 3x daily)")
    confidence: float = Field(default=0.85, description="Confidence score between 0.0 and 1.0 for this medicine identification")
    is_uncertain: bool = Field(default=False, description="True if doctor handwriting for this drug was ambiguous or hard to read")
    therapeutic_class: Optional[str] = Field(default="", description="Drug category, e.g., Antibiotic, Analgesic, Antihypertensive")
    primary_uses: Optional[str] = Field(default="", description="Standard medical indications and indications for this drug")
    warnings: Optional[str] = Field(default="", description="Important precautions, max daily dose, or contraindications")
    side_effects: List[str] = Field(default_factory=list, description="Common known side effects")

class BatchVerificationSchema(BaseModel):
    batch_number: Optional[str] = Field(default="N/A", description="Batch code or lot number if visible")
    recall_status: str = Field(default="CLEAR", description="CLEAR | RECALLED | UNKNOWN")
    expiry_date: Optional[str] = Field(default="N/A", description="Estimated or verified expiration date")
    is_expired: bool = Field(default=False, description="Whether expiry date has passed")
    database: str = Field(default="Verified Registry", description="Registry source label")

class PrescriptionAnalysisResponse(BaseModel):
    status: str = Field(default="success", description="'success' or 'partial'")
    analysis_id: str = Field(description="Unique ID for this scan transaction")
    patient_concern: str = Field(default="", description="Patient complaint, symptoms, or doctor diagnosis written on prescription")
    confidence_score: float = Field(description="Overall aggregate confidence score (0.0 to 1.0)")
    extracted_raw_text: str = Field(description="Verbatim or approximate raw OCR text from handwriting")
    identified_medicines: List[IdentifiedMedicineSchema] = Field(default_factory=list, description="Structured medicines identified")
    uncertain_segments: List[str] = Field(default_factory=list, description="Segments of illegible or ambiguous handwriting")
    safety_warnings: List[str] = Field(default_factory=list, description="General safety warnings and disclaimers")
    batch_verification: Optional[BatchVerificationSchema] = None

# ----------------- Medicine Authenticity & Prescription Verification -----------------

class MedicinePackagingInfo(BaseModel):
    brand_name: Optional[str] = Field(default="", description="Detected commercial brand name on packaging")
    generic_name_or_composition: Optional[str] = Field(default="", description="Active pharmaceutical ingredients / salts and strengths on packaging")
    manufacturer: Optional[str] = Field(default="Not visible", description="Manufacturer name (e.g., Sun Pharma, Cipla, GSK, Abbott)")
    batch_number: Optional[str] = Field(default="Not visible", description="Batch / Lot number detected on packaging")
    expiry_date: Optional[str] = Field(default="Not visible", description="Expiry date (EXP / Best before) found on packaging")
    mfg_date: Optional[str] = Field(default="Not visible", description="Manufacturing date (MFD) found on packaging")
    detected_codes: List[str] = Field(default_factory=list, description="Barcodes, QR codes, or serialization matrices visible on packaging")
    authenticity_indicators: List[str] = Field(default_factory=list, description="Visible authenticity cues (e.g. holographic strip, tamper seal, official regulatory symbols, legible fonts)")
    is_expired: bool = Field(default=False, description="True if expiry date indicates product has expired")
    authenticity_status: str = Field(default="GENUINE_INDICATORS", description="GENUINE_INDICATORS | SUSPICIOUS | UNCONFIRMED")
    authenticity_notes: str = Field(default="", description="Summary of packaging authenticity checks")

class MedicineComparisonItem(BaseModel):
    prescribed_name: str = Field(description="Medicine name written on prescription")
    prescribed_dosage: Optional[str] = Field(default="", description="Dosage and strength prescribed (e.g. 500mg, 1 tab twice daily)")
    purchased_product_name: str = Field(description="Product name detected on the purchased medicine")
    purchased_composition: Optional[str] = Field(default="", description="Active ingredients detected on purchased medicine")
    is_exact_match: bool = Field(default=False, description="True if brand/product matches exactly")
    is_generic_equivalent: bool = Field(default=False, description="True if active salt matches even if brand differs (safe generic substitution)")
    is_mismatch: bool = Field(default=False, description="True if completely different drug, dangerous substitution, or wrong medicine")
    strength_match: Optional[bool] = Field(default=True, description="True if strength/concentration matches prescription")
    dosage_form_match: Optional[bool] = Field(default=True, description="True if form matches (Tablet vs Tablet, Syrup vs Syrup)")
    status: str = Field(default="MATCH", description="MATCH | GENERIC_SUBSTITUTE | MISMATCH | CAUTION")
    explanation: str = Field(description="Clear explanation of comparison to safeguard the patient")

class VerificationResponse(BaseModel):
    status: str = Field(default="MATCH", description="MATCH | PARTIAL_MATCH | MISMATCH | UNCERTAIN")
    confidence_score: float = Field(default=0.9, description="Overall verification confidence score (0.0 to 1.0)")
    summary: str = Field(description="Summary message indicating whether user got the right medicine")
    packaging_info: MedicinePackagingInfo = Field(description="Extracted details from medicine packaging/backside")
    comparison_items: List[MedicineComparisonItem] = Field(default_factory=list, description="Per-medicine comparison against prescription")
    safety_alerts: List[str] = Field(default_factory=list, description="Urgent alerts if medicine does not match prescription or has safety risks")
    guidance: str = Field(description="Actionable patient advice")
