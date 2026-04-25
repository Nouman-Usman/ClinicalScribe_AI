import {
  MLAnalysisRequest,
  MLAnalysisResponse,
  RemedisRequest,
  RemedisResponse,
  PredictionResult,
  MLModelError,
  ModelHealth
} from './types';

const REMEDIS_URL = 'https://ghafil-airodx-backend.hf.space';
const HEALTH_CHECK_TIMEOUT = 5000;
const ANALYSIS_TIMEOUT = 30000;
const MAX_RETRIES = 3;

async function fileToBase64(file: File | string): Promise<string> {
  if (typeof file === 'string') return file;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] || result);
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
    if (typeof file === 'string') return;

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

async function callRemedisAPI(
  request: RemedisRequest,
  attempt: number = 0
): Promise<RemedisResponse> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT);

    const formData = new FormData();

    if (typeof request.frontal_image === 'string') {
      const binaryString = atob(request.frontal_image);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/jpeg' });
      formData.append('frontal_image', blob);
    } else {
      formData.append('frontal_image', request.frontal_image);
    }

    if (typeof request.lateral_image === 'string') {
      const binaryString = atob(request.lateral_image);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/jpeg' });
      formData.append('lateral_image', blob);
    } else {
      formData.append('lateral_image', request.lateral_image);
    }

    const response = await fetch(`${REMEDIS_URL}/predict`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API returned ${response.status}: ${error}`);
    }

    const data = (await response.json()) as RemedisResponse;
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Analysis timeout exceeded');
    }

    if (attempt < MAX_RETRIES) {
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return callRemedisAPI(request, attempt + 1);
    }

    throw error;
  }
}

function normalizePredictions(predictions: any): PredictionResult[] {
  if (!Array.isArray(predictions)) {
    console.warn('[REMEDIS] Invalid predictions structure:', predictions);
    return [];
  }

  return predictions
    .filter(p => p && p.score > 0.1)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .map(p => ({
      label: p.disease || p.name || 'Unknown',
      confidence: p.score || 0,
      description: `${((p.score || 0) * 100).toFixed(1)}% confidence`
    }));
}

export async function analyzeWithRemedis(request: MLAnalysisRequest): Promise<MLAnalysisResponse> {
  const startTime = Date.now();

  try {
    await validateImages(request.frontalImage, request.lateralImage);

    const frontalBase64 = await fileToBase64(request.frontalImage);
    const lateralBase64 = await fileToBase64(request.lateralImage);

    const apiRequest: RemedisRequest = {
      frontal_image: frontalBase64,
      lateral_image: lateralBase64
    };

    const response = await callRemedisAPI(apiRequest);

    console.log('[REMEDIS] API Response:', response);

    const inferenceTime = response.processing_time || Date.now() - startTime;
    const predictions = normalizePredictions(response.results || response.predictions || []);

    return {
      modelType: 'remedis-diagnostic',
      predictions,
      inferenceTime,
      timestamp: new Date().toISOString(),
      processingSteps: [
        'Input Validation',
        'Image Preprocessing',
        'Siamese Network Feature Extraction',
        'Cross-modal Attention',
        'Multimodal Fusion',
        'Diagnostic Classification'
      ]
    };
  } catch (error) {
    throw new MLModelError(
      'remedis-diagnostic',
      error instanceof Error ? error : new Error(String(error)),
      error instanceof Error && error.message.includes('timeout')
        ? 'TIMEOUT'
        : error instanceof Error && error.message.includes('Invalid')
          ? 'VALIDATION'
          : 'API_ERROR'
    );
  }
}

export async function checkRemedisHealth(): Promise<ModelHealth> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

    const response = await fetch(`${REMEDIS_URL}/health`, {
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

export function getRemedisInfo() {
  return {
    name: 'Multimodal Diagnostic Assistant',
    architecture: 'Siamese REMEDIS Network',
    specialty: 'Multimodal diagnosis',
    accuracy: 'Research-grade',
    supportedFormats: ['JPEG', 'PNG', 'DICOM'],
    requiresMultiView: true
  };
}
