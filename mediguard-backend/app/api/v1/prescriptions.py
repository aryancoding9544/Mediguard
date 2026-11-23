import base64
import time
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import PrescriptionAnalysisResponse, VerificationResponse
from app.models.request_schemas import ImageBase64Request, VerifyPrescriptionRequest
from app.services.vision_ocr_service import vision_ocr_service

# Configure console logger
logger = logging.getLogger("mediguard.ocr")
logger.setLevel(logging.INFO)

router = APIRouter()

def decode_base64_payload(raw_base64: str) -> tuple[bytes, str]:
    mime = "image/jpeg"
    raw_base64 = raw_base64.strip().strip('"').strip("'")
    if "," in raw_base64:
        header, raw_base64 = raw_base64.split(",", 1)
        if "image/png" in header:
            mime = "image/png"
        elif "image/webp" in header:
            mime = "image/webp"
        elif "image/jpeg" in header or "image/jpg" in header:
            mime = "image/jpeg"

    # Remove any whitespace or newlines inside the base64 string
    raw_base64 = "".join(raw_base64.split())

    # Fix urlsafe base64 if sent
    raw_base64 = raw_base64.replace("-", "+").replace("_", "/")

    # Ensure correct padding
    missing_padding = len(raw_base64) % 4
    if missing_padding:
        raw_base64 += "=" * (4 - missing_padding)

    image_bytes = base64.b64decode(raw_base64)
    return image_bytes, mime

@router.post("/analyze", response_model=PrescriptionAnalysisResponse)
async def analyze_prescription(file: UploadFile = File(...)):
    print("\n" + "=" * 50)
    print(f"[BACKEND LOG] Received /analyze request: filename={file.filename}, type={file.content_type}")
    if not file.content_type.startswith("image/"):
        print(f"[BACKEND LOG] REJECTED: Not an image ({file.content_type})")
        raise HTTPException(
            status_code=400,
            detail=f"Uploaded file must be an image. Received: {file.content_type}",
        )

    try:
        image_bytes = await file.read()
        print(f"[BACKEND LOG] Image bytes read: {len(image_bytes)} bytes")
        result = await vision_ocr_service.analyze_prescription_image(
            image_bytes=image_bytes,
            mime_type=file.content_type,
        )
        print(f"[BACKEND LOG] Analysis successful: {len(result.identified_medicines)} medicines identified")
        print("=" * 50 + "\n")
        return result
    except Exception as e:
        print(f"[BACKEND ERROR] /analyze failure: {str(e)}")
        print("=" * 50 + "\n")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-base64", response_model=PrescriptionAnalysisResponse)
async def analyze_prescription_base64(payload: ImageBase64Request):
    start_t = time.perf_counter()
    print("\n" + "=" * 55)
    print(f"⏱️  [ANALYTICS] Starting Prescription OCR & Analysis...")
    print(f"[BACKEND LOG] Raw base64 length: {len(payload.image_base64)} chars, MIME: {payload.mime_type}")

    try:
        image_bytes, mime = decode_base64_payload(payload.image_base64)
        print(f"[BACKEND LOG] Successfully decoded base64 into {len(image_bytes)} bytes")

        result = await vision_ocr_service.analyze_prescription_image(
            image_bytes=image_bytes,
            mime_type=payload.mime_type or mime,
        )
        elapsed_sec = time.perf_counter() - start_t
        print(f"[BACKEND LOG] Gemini Analysis SUCCESS:")
        print(f"  - Patient Concern: {result.patient_concern}")
        print(f"  - Confidence: {result.confidence_score}")
        print(f"  - Medicines Found: {[m.name for m in result.identified_medicines]}")
        print("-------------------------------------------------------")
        print(f"⏱️  [ANALYTICS TIMER] Prescription Scan Completed in: {elapsed_sec:.2f}s ({elapsed_sec*1000:.0f} ms)")
        print("=" * 55 + "\n")
        return result

    except Exception as e:
        elapsed_sec = time.perf_counter() - start_t
        print(f"[BACKEND ERROR] /analyze-base64 failure after {elapsed_sec:.2f}s: {str(e)}")
        print("=" * 55 + "\n")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-base64", response_model=VerificationResponse)
async def verify_prescription_and_medicines(payload: VerifyPrescriptionRequest):
    """
    Dual-Verification endpoint:
    Audits 1 prescription against 1+ purchased medicine packaging images.
    Returns:
    - Packaging authenticity (back-side batch, expiry, manufacturer, codes).
    - Clinical match comparison (ensures patient got the right drug).
    """
    start_t = time.perf_counter()
    print("\n" + "=" * 55)
    print(f"⏱️  [ANALYTICS] Starting Dual Verification Audit (Rx vs Meds)...")
    print(f"[BACKEND LOG] Medicine packaging images count: {len(payload.medicine_images)}")

    try:
        if not payload.prescription_image or not payload.prescription_image.image_base64:
            raise HTTPException(status_code=400, detail="Prescription image is required.")

        if not payload.medicine_images or len(payload.medicine_images) == 0:
            raise HTTPException(status_code=400, detail="At least one medicine image is required.")

        # Decode prescription image
        rx_bytes, _ = decode_base64_payload(payload.prescription_image.image_base64)
        print(f"[BACKEND LOG] Prescription decoded: {len(rx_bytes)} bytes")

        # Decode all medicine images
        med_bytes_list = []
        for i, item in enumerate(payload.medicine_images):
            m_bytes, _ = decode_base64_payload(item.image_base64)
            med_bytes_list.append(m_bytes)
            print(f"[BACKEND LOG] Medicine #{i+1} decoded: {len(m_bytes)} bytes")

        result = await vision_ocr_service.verify_prescription_against_medicines(
            prescription_bytes=rx_bytes,
            medicine_bytes_list=med_bytes_list,
        )

        elapsed_sec = time.perf_counter() - start_t
        print(f"[BACKEND LOG] Dual Verification SUCCESS:")
        print(f"  - Status: {result.status}")
        print(f"  - Brand/Product: {result.packaging_info.brand_name} ({result.packaging_info.manufacturer})")
        print(f"  - Batch / Expiry: {result.packaging_info.batch_number} / {result.packaging_info.expiry_date}")
        print(f"  - Comparison Count: {len(result.comparison_items)}")
        print("-------------------------------------------------------")
        print(f"⏱️  [ANALYTICS TIMER] Dual Verification Completed in: {elapsed_sec:.2f}s ({elapsed_sec*1000:.0f} ms)")
        print("=" * 55 + "\n")
        return result

    except HTTPException:
        raise
    except Exception as e:
        elapsed_sec = time.perf_counter() - start_t
        print(f"[BACKEND ERROR] /verify-base64 failure after {elapsed_sec:.2f}s: {str(e)}")
        print("=" * 55 + "\n")
        raise HTTPException(status_code=500, detail=str(e))
