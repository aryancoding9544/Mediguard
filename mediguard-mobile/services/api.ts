import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { File } from 'expo-file-system';
import { PrescriptionAnalysisResult, VerificationComparisonResult } from '../constants/types';

/**
 * Dynamically resolves list of candidate backend URLs in order of priority:
 * 1. Metro Host IP (auto-detected when running on device or emulator)
 * 2. 10.0.2.2 (standard Android emulator loopback alias to host machine)
 * 3. localhost (works with adb reverse tcp:8000 tcp:8000 or on web/iOS)
 * 4. Known Wi-Fi LAN IP fallback
 */
function getCandidateBaseUrls(): string[] {
  const list: string[] = [];

  // 0. Render Cloud / Production configured URL (via EXPO_PUBLIC_API_URL)
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL;
  if (configuredUrl) {
    list.push(configuredUrl.replace(/\/+$/, ''));
  }

  // 1. In Android Emulator, localhost is instant with `adb reverse tcp:8000 tcp:8000`
  // 10.0.2.2 is the official emulator-to-host loopback alias
  if (Platform.OS === 'android') {
    list.push('http://localhost:8000');
    list.push('http://10.0.2.2:8000');
  } else {
    list.push('http://localhost:8000');
  }

  // 2. Metro host IP (when running on physical devices on the same Wi-Fi)
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any)?.manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip) {
      list.push(`http://${ip}:8000`);
    }
  }

  // 3. Known LAN IP fallbacks
  if (Platform.OS === 'android') {
    list.push('http://10.98.250.173:8000');
    list.push('http://10.173.216.173:8000');
  }

  // Deduplicate preserving priority order
  return Array.from(new Set(list));
}

let activeBaseUrl: string | null = null;

export function getApiBaseUrl(): string {
  if (activeBaseUrl) return activeBaseUrl;
  const candidates = getCandidateBaseUrls();
  return candidates[0] || 'http://localhost:8000';
}

export const API_BASE_URL = getApiBaseUrl();

async function postJsonWithFallback(endpointPath: string, bodyObj: any): Promise<Response> {
  const candidates = getCandidateBaseUrls();
  if (activeBaseUrl) {
    candidates.sort((a) => (a === activeBaseUrl ? -1 : 1));
  }

  let lastError: any = null;
  for (const base of candidates) {
    const url = `${base}${endpointPath}`;
    try {
      console.log(`[MediGuard] Attempting POST -> ${url}`);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(bodyObj),
      });

      // If we got any HTTP response (even 4xx/5xx), the server is reachable
      activeBaseUrl = base;
      console.log(`[MediGuard] Connected to backend at: ${base}`);
      return res;
    } catch (err: any) {
      console.warn(`[MediGuard] Network connection failed for ${url}:`, err?.message || err);
      lastError = err;

      // If unexpected end of stream occurs (e.g. uvicorn reloaded or socket dropped), retry once
      if (err?.message?.includes('unexpected end of stream')) {
        try {
          console.log(`[MediGuard] Retrying connection to ${url} after brief delay...`);
          await new Promise((r) => setTimeout(r, 600));
          const retryRes = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(bodyObj),
          });
          activeBaseUrl = base;
          return retryRes;
        } catch (retryErr) {
          console.warn(`[MediGuard] Retry also failed for ${url}:`, retryErr);
        }
      }
    }
  }

  throw new Error(
    `Cannot connect to MediGuard backend. Tried: ${candidates.join(', ')}.\nEnsure the FastAPI backend is running (python -m uvicorn app.main:app --host 0.0.0.0 --port 8000).`
  );
}

async function fallbackUriToBase64(uri: string): Promise<string> {
  console.log('[MediGuard] Converting URI to Base64 via fallback reader...', uri.substring(0, 50));
  try {
    const res = await fetch(uri);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        if (resultStr && resultStr.includes(',')) {
          resolve(resultStr.split(',')[1]);
        } else {
          resolve(resultStr || '');
        }
      };
      reader.onerror = (err) => {
        console.error('[MediGuard] FileReader error:', err);
        reject(err);
      };
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('[MediGuard] fallbackUriToBase64 exception:', err);
    throw err;
  }
}

export async function resolveImageBase64(uri: string, preloadedBase64?: string | null): Promise<string> {
  // If preloaded Base64 string exists and is valid
  if (preloadedBase64 && preloadedBase64.length > 50) {
    if (preloadedBase64.includes(',')) {
      return preloadedBase64.split(',')[1];
    }
    return preloadedBase64;
  }

  // If URI itself is a data URI
  if (uri.startsWith('data:')) {
    return uri.split(',')[1];
  }

  // Native local file reading via Expo FileSystem File
  if (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('/')) {
    try {
      const file = new File(uri);
      const b64 = await file.base64();
      if (b64 && b64.length > 50) {
        console.log(`[MediGuard] Successfully read ${b64.length} base64 chars via Expo FileSystem`);
        return b64;
      }
    } catch (fsErr) {
      console.warn('[MediGuard] Expo FileSystem base64() reading failed, falling back:', fsErr);
    }
  }

  return await fallbackUriToBase64(uri);
}

export async function analyzePrescriptionImage(
  imageUri: string,
  preloadedBase64?: string | null
): Promise<PrescriptionAnalysisResult> {
  const startTime = Date.now();
  console.log(`[MediGuard] ========================================`);
  console.log(`[MediGuard] ⏱️  Prescription Analysis starting...`);

  const base64 = await resolveImageBase64(imageUri, preloadedBase64);

  if (!base64 || base64.length < 50) {
    throw new Error('Image data could not be read from device. Please select or capture the prescription photo again.');
  }

  const response = await postJsonWithFallback('/api/v1/prescriptions/analyze-base64', {
    image_base64: base64,
    mime_type: 'image/jpeg',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[MediGuard] Backend Returned Error (${response.status}):`, errorText);
    throw new Error(`Analysis failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[MediGuard] ========================================`);
  console.log(`[MediGuard Timer] ⏱️  Prescription Analysis Completed in: ${elapsedSec}s`);
  console.log(`[MediGuard] ========================================`);
  return data;
}

export async function verifyPrescriptionAndMedicines(
  prescription: { uri: string; base64?: string | null },
  medicines: Array<{ uri: string; base64?: string | null }>
): Promise<VerificationComparisonResult> {
  const startTime = Date.now();
  console.log(`[MediGuard] ========================================`);
  console.log(`[MediGuard] ⏱️  Dual Verification (Rx vs Meds) starting...`);
  console.log(`[MediGuard] Number of medicine photos: ${medicines.length}`);

  const rxBase64 = await resolveImageBase64(prescription.uri, prescription.base64);

  const medicinePayloads = await Promise.all(
    medicines.map(async (m) => ({
      image_base64: await resolveImageBase64(m.uri, m.base64),
      mime_type: 'image/jpeg',
    }))
  );

  const response = await postJsonWithFallback('/api/v1/prescriptions/verify-base64', {
    prescription_image: {
      image_base64: rxBase64,
      mime_type: 'image/jpeg',
    },
    medicine_images: medicinePayloads,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[MediGuard] Dual Verify Backend Error (${response.status}):`, errorText);
    throw new Error(`Verification failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[MediGuard] ========================================`);
  console.log(`[MediGuard Timer] ⏱️  Dual Verification Completed in: ${elapsedSec}s (Status: ${data.status})`);
  console.log(`[MediGuard] ========================================`);
  return data;
}

export async function sendDoctorChatMessage(
  message: string,
  history: Array<{ role: string; content: string }> = [],
  attachedPrescription?: any
): Promise<string> {
  const startTime = Date.now();
  console.log(`[MediGuard] ========================================`);
  console.log(`[MediGuard] ⏱️  Sending chat message to Dr. MediGuard... (${message.substring(0, 40)}...)`);

  const response = await postJsonWithFallback('/api/v1/chat/message', {
    message,
    history,
    attached_prescription: attachedPrescription || null,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[MediGuard] Chat API Error (${response.status}):`, errorText);
    throw new Error(`Chat error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[MediGuard] ========================================`);
  console.log(`[MediGuard Timer] ⏱️  Dr. MediGuard Replied in: ${elapsedSec}s`);
  console.log(`[MediGuard] ========================================`);
  return data.reply;
}
