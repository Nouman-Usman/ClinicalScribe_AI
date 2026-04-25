import {
  MLAnalysisRequest,
  DualModelAnalysisResult,
  ModelHealth,
  MLModelError,
  MLAnalysisResponse
} from './types';
import { analyzeWithPathologyDetector, checkPathologyDetectorHealth } from './airodx-pathology';
import { analyzeWithRemedis, checkRemedisHealth } from './airodx-remedis';

export type ExecutionMode = 'concurrent' | 'sequential';
export type ModelSelection = 'both' | 'pathology-only' | 'remedis-only';

interface AnalysisOptions {
  execution?: ExecutionMode;
  modelSelection?: ModelSelection;
}

/**
 * Analyze chest X-rays with one or both ML models
 * Supports concurrent (parallel) or sequential execution
 */
export async function analyzeChestXRay(
  frontalImage: File | string,
  lateralImage: File | string,
  options: AnalysisOptions = {}
): Promise<DualModelAnalysisResult> {
  const {
    execution = 'concurrent',
    modelSelection = 'both'
  } = options;

  const startTime = Date.now();
  const request: MLAnalysisRequest = {
    frontalImage,
    lateralImage,
    modelType: 'pathology-detector' // dummy, overridden per model
  };

  const errors: MLModelError[] = [];
  let pathologyDetector: MLAnalysisResponse | null = null;
  let remedis: MLAnalysisResponse | null = null;

  try {
    if (execution === 'concurrent') {
      await analyzeConcurrent(request, modelSelection, errors, (result, model) => {
        if (model === 'pathology') pathologyDetector = result;
        else if (model === 'remedis') remedis = result;
      });
    } else {
      await analyzeSequential(request, modelSelection, errors, (result, model) => {
        if (model === 'pathology') pathologyDetector = result;
        else if (model === 'remedis') remedis = result;
      });
    }
  } catch (error) {
    // Catastrophic failure - both models failed
    if (error instanceof MLModelError) {
      errors.push(error);
    }
  }

  const totalTime = Date.now() - startTime;

  return {
    pathologyDetector,
    remedis,
    errors,
    totalTime,
    timestamp: new Date().toISOString()
  };
}

async function analyzeConcurrent(
  request: MLAnalysisRequest,
  modelSelection: ModelSelection,
  errors: MLModelError[],
  onResult: (result: MLAnalysisResponse, model: 'pathology' | 'remedis') => void
): Promise<void> {
  const promises: Promise<[string, MLAnalysisResponse | null]>[] = [];

  if (modelSelection === 'both' || modelSelection === 'pathology-only') {
    promises.push(
      analyzeWithPathologyDetector({ ...request, modelType: 'pathology-detector' })
        .then(result => {
          onResult(result, 'pathology');
          return ['pathology', result] as const;
        })
        .catch(error => {
          if (error instanceof MLModelError) errors.push(error);
          return ['pathology', null] as const;
        })
    );
  }

  if (modelSelection === 'both' || modelSelection === 'remedis-only') {
    promises.push(
      analyzeWithRemedis({ ...request, modelType: 'remedis-diagnostic' })
        .then(result => {
          onResult(result, 'remedis');
          return ['remedis', result] as const;
        })
        .catch(error => {
          if (error instanceof MLModelError) errors.push(error);
          return ['remedis', null] as const;
        })
    );
  }

  await Promise.all(promises);
}

async function analyzeSequential(
  request: MLAnalysisRequest,
  modelSelection: ModelSelection,
  errors: MLModelError[],
  onResult: (result: MLAnalysisResponse, model: 'pathology' | 'remedis') => void
): Promise<void> {
  if (modelSelection === 'both' || modelSelection === 'pathology-only') {
    try {
      const result = await analyzeWithPathologyDetector({
        ...request,
        modelType: 'pathology-detector'
      });
      onResult(result, 'pathology');
    } catch (error) {
      if (error instanceof MLModelError) errors.push(error);
    }
  }

  if (modelSelection === 'both' || modelSelection === 'remedis-only') {
    try {
      const result = await analyzeWithRemedis({
        ...request,
        modelType: 'remedis-diagnostic'
      });
      onResult(result, 'remedis');
    } catch (error) {
      if (error instanceof MLModelError) errors.push(error);
    }
  }
}

/**
 * Check health of both model APIs
 */
export async function checkModelsHealth(): Promise<{
  pathology: ModelHealth;
  remedis: ModelHealth;
}> {
  const [pathology, remedis] = await Promise.all([
    checkPathologyDetectorHealth(),
    checkRemedisHealth()
  ]);

  return { pathology, remedis };
}

/**
 * Get metadata about both models
 */
export function getModelsInfo() {
  return {
    pathologyDetector: {
      name: 'Chest X-Ray Pathology Detector',
      architecture: 'DINO Vision Transformer',
      diseases: 14,
      accuracy: 'Clinical-grade',
      supportedFormats: ['JPEG', 'PNG', 'DICOM'],
      requiresMultiView: true,
      url: 'https://noumanusman-airodx.hf.space'
    },
    remedis: {
      name: 'Multimodal Diagnostic Assistant',
      architecture: 'Siamese REMEDIS Network',
      specialty: 'Multimodal diagnosis',
      accuracy: 'Research-grade',
      supportedFormats: ['JPEG', 'PNG', 'DICOM'],
      requiresMultiView: true,
      url: 'https://ghafil-airodx-backend.hf.space'
    }
  };
}
