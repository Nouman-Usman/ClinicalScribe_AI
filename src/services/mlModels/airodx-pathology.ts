import {
  MLAnalysisRequest,
  MLAnalysisResponse,
  AiroDxPathologyRequest,
  AiroDxPathologyResponse,
  PredictionResult,
  MLModelError,
  ModelHealth
} from './types';

const PATHOLOGY_DETECTOR_URL = 'https://noumanusman-airodx.hf.space';
const HEALTH_CHECK_TIMEOUT = 5000;
const ANALYSIS_TIMEOUT = 30000;
const MAX_RETRIES = 3;

async function fileToBase64(file: File | string): Promise<string> {
  if (typeof file === 'string') return file;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] || result); // Remove data:image/png;base64, prefix if present
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function validateImages(
  frontal: File | string,
  lateral: File | string
): Promise<void> {
  const validateFile = (file: File | string, name: string) => {
    if (typeof file === 'string') return; // Assume base64 is pre-validated

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/dicom'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!validTypes.includes(file.type)) {
      throw new Error(`Invalid ${name} type: ${file.type}`);
    }

    if (file.size > maxSize) {
      throw new Error(`${name} exceeds max size of 50MB`);
    }
  };

  validateFile(frontal, 'frontal');
  validateFile(lateral, 'lateral');
}

async function callPathologyAPI(
  request: AiroDxPathologyRequest,
  attempt: number = 0
): Promise<AiroDxPathologyResponse> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT);

    const formData = new FormData();

    if (typeof request.frontal === 'string') {
      const binaryString = atob(request.frontal);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/jpeg' });
      formData.append('frontal', blob);
    } else {
      formData.append('frontal', request.frontal);
    }

    if (typeof request.lateral === 'string') {
      const binaryString = atob(request.lateral);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/jpeg' });
      formData.append('lateral', blob);
    } else {
      formData.append('lateral', request.lateral);
    }

    const response = await fetch(`${PATHOLOGY_DETECTOR_URL}/predict`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API returned ${response.status}: ${error}`);
    }

    const data = (await response.json()) as AiroDxPathologyResponse;
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Analysis timeout exceeded');
    }

    if (attempt < MAX_RETRIES) {
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return callPathologyAPI(request, attempt + 1);
    }

    throw error;
  }
}

function normalizePredictions(
  predictions: any
): PredictionResult[] {
  if (!Array.isArray(predictions)) {
    console.warn('[Pathology] Invalid predictions structure:', predictions);
    return [];
  }

  return predictions
    .filter(p => p && (p.probability || p.score || 0) > 0.1)
    .sort((a, b) => (b.probability || b.score || 0) - (a.probability || a.score || 0))
    .map(p => ({
      label: p.disease || p.name || 'Unknown',
      confidence: p.probability || p.score || 0,
      description: `${((p.probability || p.score || 0) * 100).toFixed(1)}% confidence`
    }));
}

export async function analyzeWithPathologyDetector(
  request: MLAnalysisRequest
): Promise<MLAnalysisResponse> {
  const startTime = Date.now();

  try {
    // Validate inputs
    await validateImages(request.frontalImage, request.lateralImage);

    // Convert to base64 if needed
    const frontalBase64 = await fileToBase64(request.frontalImage);
    const lateralBase64 = await fileToBase64(request.lateralImage);

    // Call API
    const apiRequest: AiroDxPathologyRequest = {
      frontal: frontalBase64,
      lateral: lateralBase64
    };

    const response = await callPathologyAPI(apiRequest);

    console.log('[Pathology] API Response:', response);

    const inferenceTime = response.inference_time || Date.now() - startTime;
    const predictions = normalizePredictions(response.predictions || []);

    return {
      modelType: 'pathology-detector',
      predictions,
      inferenceTime,
      timestamp: new Date().toISOString(),
      processingSteps: [
        'Input Validation',
        'Image Preprocessing',
        'DINO Vision Transformer Feature Extraction',
        'Multi-label Classification',
        'Confidence Filtering'
      ]
    };
  } catch (error) {
    throw new MLModelError(
      'pathology-detector',
      error instanceof Error ? error : new Error(String(error)),
      error instanceof Error && error.message.includes('timeout')
        ? 'TIMEOUT'
        : error instanceof Error && error.message.includes('Invalid')
          ? 'VALIDATION'
          : 'API_ERROR'
    );
  }
}

export async function checkPathologyDetectorHealth(): Promise<ModelHealth> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

    const response = await fetch(`${PATHOLOGY_DETECTOR_URL}/health`, {
      signal: controller.signal
    });

    clearTimeout(timeout);

    return {
      healthy: response.ok,
      status: response.ok ? 'operational' : 'degraded',
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    return {
      healthy: false,
      status: 'offline',
      lastCheck: new Date().toISOString()
    };
  }
}

export function getPathologyDetectorInfo() {
  return {
    name: 'Chest X-Ray Pathology Detector',
    architecture: 'DINO Vision Transformer',
    diseases: 14,
    accuracy: 'Clinical-grade',
    supportedFormats: ['JPEG', 'PNG', 'DICOM'],
    requiresMultiView: true
  };
}
