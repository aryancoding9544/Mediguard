import os
import logging
from google import genai
from google.genai import types
from app.core.config import settings

logger = logging.getLogger("mediguard.chat")
logger.setLevel(logging.INFO)

DOCTOR_SYSTEM_PROMPT = """You are Dr. MediGuard, a compassionate, board-certified Chief Medical Consultant and Clinical Pharmacologist AI.
You are directly speaking with a patient seeking clinical guidance, prescription understanding, drug safety consultation, or health advice.

YOUR CORE CLINICAL PRINCIPLES:
1. Warm, Empathetic Bedside Manner:
   - Greet the patient warmly, listen actively, and speak with empathy, reassurance, and respect.
   - Explain medical and pharmacological concepts in clear, easy-to-understand language without sacrificing scientific accuracy.

2. Pharmacological & Prescription Expertise:
   - Clarify medicine purposes, standard dosages, active ingredients (generic salts), and administration guidelines (e.g. with meals, on an empty stomach, morning vs night).
   - Explain possible drug interactions, food/drink precautions (e.g. alcohol, grapefruit), and common vs rare adverse effects.
   - When discussing prescription medications, emphasize the importance of adhering to the treating physician's prescribed duration.

3. Differential Diagnostic Reasoning:
   - When a patient describes symptoms (e.g., headache, fever, cough, stomach pain, rashes), discuss likely common causes, lifestyle remedies, and over-the-counter options if suitable.
   - Ask clarifying clinical questions (e.g. duration, intensity, other symptoms, existing medical conditions, allergies) to provide tailored advice.

4. Patient Safety & Red Flags:
   - Always prioritize patient safety. If the user presents red-flag emergency symptoms (such as acute chest pain, sudden numbness or speech difficulty, severe shortness of breath, anaphylaxis, uncontrollable bleeding, or persistent high fever with stiff neck), immediately and prominently advise seeking urgent emergency care (ER/911/112).
   - Include a concise, supportive disclaimer that your advice serves as clinical guidance and does not replace an in-person physical examination by their primary healthcare provider.

5. Formatting & Presentation:
   - Use clear markdown: bold important medicine names and key precautions, use concise bullet points, and keep paragraphs well-spaced for readability on mobile screens.

6. Ultra-Fast, Concise Delivery:
   - Be direct, focused, and high-yield. Skip long introductory pleasantries or conversational filler.
   - Deliver actionable clinical guidance in 2 to 3 compact paragraphs or concise bullet points (around 100-150 words maximum).
   - Get straight to the key facts: what the medicine does, how/when to take it, main side effects, and adherence.
"""

CANDIDATE_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
]

class DoctorChatService:
    def __init__(self):
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        if api_key:
            self.client = genai.Client(api_key=api_key)
        else:
            self.client = None

    async def get_doctor_response(
        self,
        message: str,
        history: list[dict] = None,
        attached_prescription: dict = None,
    ) -> str:
        if not self.client:
            api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
            if api_key:
                self.client = genai.Client(api_key=api_key)
            else:
                raise RuntimeError("Gemini API key is not configured in mediguard-backend/.env")

        # Build clinical system prompt with attached record if present
        effective_system_prompt = DOCTOR_SYSTEM_PROMPT
        if attached_prescription:
            is_verification = (
                attached_prescription.get("type") == "verification"
                or bool(attached_prescription.get("verification_result"))
            )

            rx_details = "\n=========================================\n"
            if is_verification:
                rx_details += "PATIENT HAS ATTACHED A DUAL VERIFICATION AUDIT (DOCTOR'S PRESCRIPTION VS. PURCHASED MEDICINE PACKAGING):\n"
                if attached_prescription.get("order_number"):
                    rx_details += f"- Audit Record ID: {attached_prescription['order_number']}\n"
                
                vf = attached_prescription.get("verification_result") or {}
                rx_details += f"- Overall Verification Match Status: {vf.get('status', 'PENDING')}\n"
                if vf.get("summary"):
                    rx_details += f"- Audit Summary: {vf.get('summary')}\n"

                # Comparison items
                comp_items = vf.get("comparison_items") or []
                if comp_items:
                    rx_details += "- Medicine Comparison (Prescribed vs Purchased Product):\n"
                    for idx, ci in enumerate(comp_items):
                        rx_details += f"  {idx+1}. Prescribed: \"{ci.get('prescribed_name')}\" (Dosage: {ci.get('prescribed_dosage')})\n"
                        rx_details += f"     Purchased: \"{ci.get('purchased_product_name')}\" [Composition: {ci.get('purchased_composition')}]\n"
                        rx_details += f"     Match Assessment: {ci.get('status')} | Exact Match: {ci.get('is_exact_match')} | Generic Equivalent: {ci.get('is_generic_equivalent')} | Mismatch: {ci.get('is_mismatch')}\n"
                        if ci.get('explanation'):
                            rx_details += f"     Pharmacological Evaluation: {ci.get('explanation')}\n"

                # Packaging and Authenticity Info
                pkg = vf.get("packaging_info") or {}
                if pkg:
                    rx_details += f"- Packaging & Authenticity Verification:\n"
                    rx_details += f"  * Brand: {pkg.get('brand_name')} | Generic/Salt: {pkg.get('generic_name_or_composition')}\n"
                    rx_details += f"  * Manufacturer: {pkg.get('manufacturer', 'N/A')}\n"
                    rx_details += f"  * Batch Number: {pkg.get('batch_number', 'N/A')} | Expiry: {pkg.get('expiry_date', 'N/A')} (Expired: {pkg.get('is_expired', False)})\n"
                    rx_details += f"  * Authenticity Status: {pkg.get('authenticity_status', 'N/A')}\n"
                    if pkg.get('authenticity_notes'):
                        rx_details += f"  * Authenticity Notes: {pkg.get('authenticity_notes')}\n"

                # Safety alerts
                alerts = vf.get("safety_alerts") or []
                if alerts:
                    rx_details += f"- Safety Alerts Flagged: {'; '.join(alerts)}\n"

                # Pharmacist guidance
                if vf.get("guidance"):
                    rx_details += f"- Pharmacist Guidance: {vf.get('guidance')}\n"

                rx_details += """
CRITICAL CLINICAL INSTRUCTION FOR DUAL VERIFICATION:
The patient is inquiring about whether the medicine they bought from the pharmacy correctly and safely matches their doctor's prescription.
1. Cross-check whether the purchased product is an exact brand match, an approved bioequivalent generic substitute, or a dangerous mismatch.
2. Verify if the active salt composition and dosages/strengths align.
3. Check the batch validity, expiration date, and packaging authenticity markers.
4. Clearly explain to the patient whether it is safe to take, what differences exist between the brand and generic (if any), and whether they need to return to the pharmacist or doctor before taking it.
=========================================
"""
            else:
                rx_details += "PATIENT HAS ATTACHED THE FOLLOWING MEDICAL PRESCRIPTION FROM THEIR HISTORY:\n"
                if attached_prescription.get("order_number"):
                    rx_details += f"- Prescription Order ID: {attached_prescription['order_number']}\n"
                if attached_prescription.get("patient_concern"):
                    rx_details += f"- Diagnosis / Patient Symptoms: {attached_prescription['patient_concern']}\n"
                if attached_prescription.get("confidence_score"):
                    rx_details += f"- OCR Verification Confidence: {attached_prescription['confidence_score']}\n"

                meds = attached_prescription.get("medicines") or []
                if meds:
                    rx_details += "- Prescribed Medications Identified by Doctor:\n"
                    for idx, m in enumerate(meds):
                        rx_details += f"  {idx+1}. {m.get('name')}"
                        if m.get('generic_name'):
                            rx_details += f" (Generic/Salt: {m['generic_name']})"
                        if m.get('dosage'):
                            rx_details += f" - Prescribed Dosage: {m['dosage']}"
                        if m.get('therapeutic_class'):
                            rx_details += f" [Class: {m['therapeutic_class']}]"
                        if m.get('primary_uses'):
                            rx_details += f"\n     Primary Indication: {m['primary_uses']}"
                        if m.get('warnings'):
                            rx_details += f"\n     Safety Precautions: {m['warnings']}"
                        rx_details += "\n"

                bv = attached_prescription.get("batch_verification")
                if bv:
                    rx_details += f"- Safety Registry: Batch #{bv.get('batch_number', 'N/A')} | Recall: {bv.get('recall_status', 'CLEAR')} | Exp: {bv.get('expiry_date', 'N/A')}\n"

                if attached_prescription.get("raw_text"):
                    rx_details += f"- Verbatim Handwritten Rx Notes: \"{attached_prescription['raw_text']}\"\n"

                rx_details += """
CRITICAL CONSULTATION INSTRUCTION:
The patient is directly inquiring about this specific attached prescription.
Reference these medications by name, explain how and when to take them, address any potential drug-drug or drug-food interactions, explain side effects, clarify dosage timings, and provide reassuring clinical guidance tailored to their diagnosis and inquiry.
=========================================
"""
            effective_system_prompt += rx_details

        # Format conversation contents for Gemini API
        contents = []
        if history:
            for item in history:
                role = "user" if item.get("role") in ["user", "patient"] else "model"
                text = item.get("content", "")
                if text:
                    contents.append(
                        types.Content(
                            role=role,
                            parts=[types.Part.from_text(text=text)],
                        )
                    )

        # Append current user prompt
        contents.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=message)],
            )
        )

        last_error = None
        for model_name in CANDIDATE_MODELS:
            try:
                print(f"[DoctorChatService] Generating rapid reply with model: {model_name}...")
                response = self.client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=effective_system_prompt,
                        temperature=0.3,
                        max_output_tokens=380,
                        thinking_config=types.ThinkingConfig(thinking_budget=0),
                    ),
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                print(f"[DoctorChatService] Model {model_name} error: {e}")
                last_error = e

        raise RuntimeError(f"All Gemini models failed to generate response: {last_error}")

doctor_chat_service = DoctorChatService()
