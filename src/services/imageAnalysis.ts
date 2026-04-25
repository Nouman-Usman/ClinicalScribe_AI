
export interface Finding {
    id: string;
    label: string;
    confidence: number;
    description: string;
    region?: { x: number; y: number; width: number; height: number }; // percentage 0-100
}

export interface AnalysisResult {
    id: string;
    imageUrl: string; // url or base64
    analysisType: string;
    modelUsed: string;
    findings: Finding[];
    confidence: number;
    camImage?: string; // Class Activation Map overlay if applicable
    timestamp: string;
    processingSteps?: string[]; // For "Glass Box" transparency
    metadata?: {
        totalTime: number;
        pathologyDetectorErrors: any[];
        remedisErrors: any[];
        commonFindings?: string[]; // Findings detected by both models
        uncommonFindings?: string[]; // Findings detected by only one model
    };
}

export type AnalysisType = 'custom' | 'report-generation' | 'disease-classification';

export const ANALYSIS_TYPES = [
    { id: 'custom', label: 'Build Your Own Analysis', description: 'Create custom analysis workflow' },
    { id: 'report-generation', label: 'Report Generation', description: 'Detects lung capacity and diseases' },
    { id: 'disease-classification', label: 'Disease Classification', description: 'Identify and classify medical conditions' },
];

export const AVAILABLE_MODELS = [
    { id: 'pathology-detector', label: 'Pathology Detector (DINO)', description: 'Chest X-Ray Disease Classification' },
    { id: 'remedis', label: 'REMEDIS Diagnostic', description: 'Multimodal Analysis' },
    { id: 'both', label: 'Dual Analysis', description: 'Both Models' },
];

export type ModelId = 'pathology-detector' | 'remedis' | 'both';

interface AnalyzeImageOptions {
    frontalImage: File;
    lateralImage?: File;
}

/**
 * Analyze chest X-rays using real ML models
 * Requires both frontal AND lateral images for accurate analysis
 */
export async function analyzeImage(
    options: AnalyzeImageOptions,
    modelId: ModelId = 'both'
): Promise<AnalysisResult> {
    const { frontalImage, lateralImage } = options;

    if (!lateralImage) {
        throw new Error('Both frontal and lateral X-ray images are required for analysis');
    }

    // Validate file sizes and types
    const validateFile = (file: File, name: string) => {
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            throw new Error(`Invalid ${name} type. Supported: JPEG, PNG`);
        }
        if (file.size > 50 * 1024 * 1024) {
            throw new Error(`${name} exceeds 50MB limit`);
        }
    };

    validateFile(frontalImage, 'Frontal image');
    validateFile(lateralImage, 'Lateral image');

    // Import ML service dynamically to avoid circular dependencies
    const { analyzeChestXRay } = await import('./mlModels/mlService');

    const startTime = Date.now();

    // Determine execution mode and model selection
    let modelSelection: 'both' | 'pathology-only' | 'remedis-only' = 'both';
    if (modelId === 'pathology-detector') modelSelection = 'pathology-only';
    else if (modelId === 'remedis') modelSelection = 'remedis-only';

    try {
        const result = await analyzeChestXRay(frontalImage, lateralImage, {
            execution: 'concurrent',
            modelSelection
        });

        const totalTime = Date.now() - startTime;

        // Merge results from both models if both ran
        const allFindings: Finding[] = [];
        const allSteps: string[] = [];
        const pathologyLabels = new Set<string>();
        const remedisLabels = new Set<string>();

        if (result.pathologyDetector) {
            result.pathologyDetector.predictions.forEach((pred, idx) => {
                pathologyLabels.add(pred.label.toLowerCase());
                allFindings.push({
                    id: `pathology-${idx}`,
                    label: pred.label,
                    confidence: pred.confidence,
                    description: pred.description || `${(pred.confidence * 100).toFixed(1)}% confidence`
                });
            });
            allSteps.push('Pathology Detector:', ...result.pathologyDetector.processingSteps!);
        }

        if (result.remedis) {
            result.remedis.predictions.forEach((pred, idx) => {
                remedisLabels.add(pred.label.toLowerCase());
                allFindings.push({
                    id: `remedis-${idx}`,
                    label: pred.label,
                    confidence: pred.confidence,
                    description: pred.description || `${(pred.confidence * 100).toFixed(1)}% confidence`
                });
            });
            allSteps.push('REMEDIS Diagnostic:', ...result.remedis.processingSteps!);
        }

        // Identify common and uncommon findings
        const commonFindings: string[] = [];
        const uncommonFindings: string[] = [];

        if (pathologyLabels.size > 0 && remedisLabels.size > 0) {
            // Common: detected by both models
            pathologyLabels.forEach(label => {
                if (remedisLabels.has(label)) {
                    commonFindings.push(label);
                } else {
                    uncommonFindings.push(label);
                }
            });
            // Uncommon: only in REMEDIS
            remedisLabels.forEach(label => {
                if (!pathologyLabels.has(label)) {
                    uncommonFindings.push(label);
                }
            });
        }

        // Sort by confidence
        allFindings.sort((a, b) => b.confidence - a.confidence);

        // Calculate average confidence
        const avgConfidence =
            allFindings.length > 0
                ? allFindings.reduce((sum, f) => sum + f.confidence, 0) / allFindings.length
                : 0;

        if (result.errors.length > 0) {
            console.warn('ML Analysis Errors:', result.errors);
        }

        return {
            id: crypto.randomUUID(),
            imageUrl: URL.createObjectURL(frontalImage),
            analysisType: 'disease-classification',
            modelUsed: modelId,
            findings: allFindings,
            confidence: avgConfidence,
            timestamp: new Date().toISOString(),
            processingSteps: allSteps,
            metadata: {
                totalTime,
                pathologyDetectorErrors: result.errors.filter(e => e.modelType === 'pathology-detector'),
                remedisErrors: result.errors.filter(e => e.modelType === 'remedis-diagnostic'),
                commonFindings: commonFindings.length > 0 ? commonFindings : undefined,
                uncommonFindings: uncommonFindings.length > 0 ? uncommonFindings : undefined
            }
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error during analysis';
        console.error('Image Analysis Error:', error);
        throw new Error(`Analysis failed: ${message}`);
    }
}

// Legacy function signature support (for backwards compatibility)
export const analyzeImageLegacy = async (
    file: File,
    type: AnalysisType,
    modelId: string
): Promise<AnalysisResult> => {
    // Fallback for old code - requires mock since we need both images
    console.warn('Using legacy analyzeImage signature. Please provide both frontal and lateral images.');
    throw new Error('Legacy API requires migration. Use new analyzeImage(options, modelId) signature.');
};
