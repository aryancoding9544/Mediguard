from pydantic import BaseModel, Field
from typing import List, Optional

class ImageBase64Request(BaseModel):
    image_base64: str = Field(description="Base64 encoded string of prescription image")
    mime_type: Optional[str] = Field(default="image/jpeg", description="MIME type, e.g. image/jpeg, image/png")

class VerifyItemRequest(BaseModel):
    image_base64: str = Field(description="Base64 encoded string of image")
    mime_type: Optional[str] = Field(default="image/jpeg", description="MIME type, e.g. image/jpeg, image/png")

class VerifyPrescriptionRequest(BaseModel):
    prescription_image: VerifyItemRequest = Field(description="Prescription image data")
    medicine_images: List[VerifyItemRequest] = Field(description="List of purchased medicine images (front, back, label, etc.)")
