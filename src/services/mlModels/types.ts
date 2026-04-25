// Unified types for ML model APIs

export type ModelType = 'pathology-detector' | 'remedis-diagnostic';

export interface PredictionResult {
  label: string;
  confidence: number;
  description?: string;
}

export interface MLAnalysisRequest {
  frontalImage: File | string; // File or base64
  lateralImage: File | string;
  modelType: ModelType;
}

export interface MLAnalysisResponse {
  modelType: ModelType;
  predictions: PredictionResult[];
  inferenceTime: number; // milliseconds
  timestamp: string;
  processingSteps?: string[];
}

// Model-specific request/response types

export interface AiroDxPathologyRequest {
  frontal: string | Blob; // binary
  lateral: string | Blob; // binary
}

export interface AiroDxPathologyPrediction {
  disease: string;
  probability: number;
}

export interface AiroDxPathologyResponse {
  predictions: AiroDxPathologyPrediction[];
  inference_time: number;
}

export interface RemedisRequest {
  frontal_image: string | Blob;
  lateral_image: string | Blob;
}

export interface RemeidisPrediction {
  disease: string;
  score: number;
}

export interface RemedisResponse {
  results: RemeidisPrediction[];
  processing_time: number;
}

// Error types
export class MLModelError extends Error {
  constructor(
    public modelType: ModelType,
    public originalError: Error,
    public code: 'TIMEOUT' | 'VALIDATION' | 'NETWORK' | 'API_ERROR' | 'PARSE_ERROR'
  ) {
    super(`${modelType} error [${code}]: ${originalError.message}`);
    this.name = 'MLModelError';
  }
}

export interface ModelHealth {
  healthy: boolean;
  status: 'operational' | 'degraded' | 'offline';
  lastCheck: string;
}

export interface DualModelAnalysisResult {
  pathologyDetector: MLAnalysisResponse | null;
  remedis: MLAnalysisResponse | null;
  errors: MLModelError[];
  totalTime: number;
  timestamp: string;
}
