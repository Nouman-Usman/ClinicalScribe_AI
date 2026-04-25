import { useState, useEffect, useRef, useMemo } from 'react';
import { MedicalImageViewer } from '@/components/analysis/MedicalImageViewer';
import { AgentChatInterface } from '@/components/analysis/AgentChatInterface';
import { ImageUploader } from '@/components/analysis/ImageUploader';
import { ModelSelector } from '@/components/analysis/ModelSelector';
import { analyzeImage, type AnalysisResult, type ModelId } from '@/services/imageAnalysis';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { User, Page } from '@/App';

interface ImageAnalysisPageProps {
    user: User;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
}

export default function ImageAnalysisPage({ user, onNavigate, onLogout }: ImageAnalysisPageProps) {
    const [frontalFile, setFrontalFile] = useState<File | null>(null);
    const [lateralFile, setLateralFile] = useState<File | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeFindingId, setActiveFindingId] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<ModelId>('both');
    const [executionMode, setExecutionMode] = useState<'concurrent' | 'sequential'>('concurrent');
    const [mobileTab, setMobileTab] = useState<'image' | 'results' | 'chat'>('image');

    const objectUrlsRef = useRef<{ frontal: string | null; lateral: string | null }>({ frontal: null, lateral: null });
    const abortRef = useRef<AbortController | null>(null);

    const frontUrl = useMemo(() => {
        if (!frontalFile) {
            if (objectUrlsRef.current.frontal) URL.revokeObjectURL(objectUrlsRef.current.frontal);
            objectUrlsRef.current.frontal = null;
            return null;
        }
        if (objectUrlsRef.current.frontal) URL.revokeObjectURL(objectUrlsRef.current.frontal);
        const url = URL.createObjectURL(frontalFile);
        objectUrlsRef.current.frontal = url;
        console.log('[Upload] Frontal file loaded:', frontalFile.name);
        return url;
    }, [frontalFile]);

    const lateralUrl = useMemo(() => {
        if (!lateralFile) {
            if (objectUrlsRef.current.lateral) URL.revokeObjectURL(objectUrlsRef.current.lateral);
            objectUrlsRef.current.lateral = null;
            return null;
        }
        if (objectUrlsRef.current.lateral) URL.revokeObjectURL(objectUrlsRef.current.lateral);
        const url = URL.createObjectURL(lateralFile);
        objectUrlsRef.current.lateral = url;
        console.log('[Upload] Lateral file loaded:', lateralFile.name);
        return url;
    }, [lateralFile]);

    useEffect(() => {
        return () => {
            if (objectUrlsRef.current.frontal) URL.revokeObjectURL(objectUrlsRef.current.frontal);
            if (objectUrlsRef.current.lateral) URL.revokeObjectURL(objectUrlsRef.current.lateral);
            abortRef.current?.abort();
        };
    }, []);

    const handleFrontalSelect = (file: File | null) => {
        console.log('[Upload] Frontal selected:', file?.name || 'cleared');
        setFrontalFile(file);
    };

    const handleLateralSelect = (file: File | null) => {
        console.log('[Upload] Lateral selected:', file?.name || 'cleared');
        setLateralFile(file);
    };

    const handleAnalyze = async () => {
        if (!frontalFile || !lateralFile) {
            toast.error('Need both frontal and lateral images');
            return;
        }

        console.log('[Analysis] Starting with:', frontalFile.name, lateralFile.name, 'Model:', selectedModel);
        setIsLoading(true);
        abortRef.current = new AbortController();

        try {
            const data = await analyzeImage(
                { frontalImage: frontalFile, lateralImage: lateralFile },
                selectedModel
            );
            console.log('[Analysis] Complete:', data);
            setResult(data);
            toast.success('Analysis complete');
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Analysis failed';
            console.error('[Analysis] Error:', e);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        console.log('[Reset] Clearing all');
        setFrontalFile(null);
        setLateralFile(null);
        setResult(null);
        setActiveFindingId(null);
        abortRef.current?.abort();
    };

    const hasImages = !!(frontalFile && lateralFile);
    const displayUrl = result?.imageUrl || frontUrl;

    return (
        <DashboardLayout user={user} currentPage="image-analysis" onNavigate={onNavigate} onLogout={onLogout}>
            <div className="h-[calc(100vh-100px)] min-h-screen flex flex-col animate-in fade-in duration-500 bg-white">
                {!hasImages ? (
                    // Mobile-First Upload Screen
                    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
                        <div className="w-full max-w-2xl">
                            {/* Header */}
                            <div className="text-center mb-8 md:mb-12">
                                <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                                    Classification-Based Analysis
                                </div>
                                <h1 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">
                                    AiroDx Analysis
                                </h1>
                                <p className="text-slate-600 text-sm md:text-base mb-1">
                                    Upload chest X-rays for instant AI analysis
                                </p>
                                <p className="text-slate-500 text-xs">No patient data stored • HIPAA compliant</p>
                            </div>

                            {/* Upload Section */}
                            <div className="space-y-4 md:space-y-6">
                                {/* Image Upload Grid - Mobile optimized */}
                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                            <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">1</span>
                                            Frontal X-Ray (PA/AP)
                                        </h3>
                                        <ImageUploader
                                            selectedFile={frontalFile}
                                            onFileSelect={handleFrontalSelect}
                                            resetAnalysis={() => setResult(null)}
                                        />
                                    </div>

                                    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                            <span className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 text-xs font-bold">2</span>
                                            Lateral X-Ray
                                        </h3>
                                        <ImageUploader
                                            selectedFile={lateralFile}
                                            onFileSelect={handleLateralSelect}
                                            resetAnalysis={() => setResult(null)}
                                        />
                                    </div>
                                </div>

                                {/* Model & Execution Settings */}
                                <div className="space-y-4">
                                    <ModelSelector
                                        selectedModel={selectedModel}
                                        onModelChange={setSelectedModel}
                                        executionMode={executionMode}
                                        onExecutionModeChange={setExecutionMode}
                                        compact={true}
                                    />
                                </div>

                                {/* Analysis Button */}
                                {hasImages && (
                                    <Button
                                        onClick={handleAnalyze}
                                        disabled={isLoading}
                                        className="w-full py-6 text-base font-semibold"
                                        size="lg"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            'Start Analysis'
                                        )}
                                    </Button>
                                )}
                            </div>

                            {/* Info Footer */}
                            <div className="mt-8 md:mt-12 pt-8 border-t border-slate-200 text-center text-xs text-slate-500 space-y-2">
                                <p>✓ JPEG, PNG supported • Max 50MB each</p>
                                <p>✓ Analysis powered by Groq • Results cached securely</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Results Screen - Mobile-First
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Desktop: Professional Layout */}
                        <div className="hidden lg:flex h-full gap-6 p-6 bg-white">
                            {/* Left: Image Viewer - 45% */}
                            <div className="flex-1 min-w-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                                <MedicalImageViewer
                                    imageUrl={displayUrl}
                                    findings={result?.findings || []}
                                    isLoading={isLoading}
                                    activeFindingId={activeFindingId}
                                    onFindingClick={setActiveFindingId}
                                />
                            </div>

                            {/* Right: Results + Chat - 55% */}
                            <div className="flex-1 min-w-0 flex flex-col gap-6">
                                {/* Results Panel */}
                                <div className="flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-h-[45%] overflow-y-auto">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-slate-900">Analysis Results</h3>
                                        <p className="text-xs text-slate-500 mt-1">Model: {result?.modelUsed} • Confidence: {(result?.confidence * 100).toFixed(1)}%</p>
                                    </div>

                                    {selectedModel === 'both' && result?.metadata?.commonFindings && result?.metadata?.commonFindings.length > 0 && (
                                        <div className="mb-4 pb-4 border-b border-slate-200">
                                            <h4 className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded mb-2 inline-block">✓ Common (Both Models)</h4>
                                            <div className="space-y-2">
                                                {result?.findings?.filter(f => result?.metadata?.commonFindings?.includes(f.label.toLowerCase())).map((f) => (
                                                    <div key={f.id} className="flex items-center gap-3 p-3 hover:bg-green-50 rounded-lg cursor-pointer transition-colors border-l-2 border-green-400" onClick={() => setActiveFindingId(f.id)}>
                                                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 flex-shrink-0 text-xs font-bold">{(f.confidence * 100).toFixed(0)}%</div>
                                                        <span className="text-sm font-medium text-slate-800 flex-1">{f.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedModel === 'both' && result?.metadata?.uncommonFindings && result?.metadata?.uncommonFindings.length > 0 && (
                                        <div className="mb-4 pb-4 border-b border-slate-200">
                                            <h4 className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded mb-2 inline-block">⚠ Single Model</h4>
                                            <div className="space-y-2">
                                                {result?.findings?.filter(f => result?.metadata?.uncommonFindings?.includes(f.label.toLowerCase())).map((f) => (
                                                    <div key={f.id} className="flex items-center gap-3 p-3 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors border-l-2 border-amber-400" onClick={() => setActiveFindingId(f.id)}>
                                                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0 text-xs font-bold">{(f.confidence * 100).toFixed(0)}%</div>
                                                        <span className="text-sm text-slate-800 flex-1">{f.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedModel !== 'both' && (
                                        <div className="space-y-2">
                                            {result?.findings?.map((f) => (
                                                <div key={f.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border-l-2 border-blue-400" onClick={() => setActiveFindingId(f.id)}>
                                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0 text-xs font-bold">{(f.confidence * 100).toFixed(0)}%</div>
                                                    <div className="flex-1">
                                                        <span className="text-sm font-medium text-slate-800 block">{f.label}</span>
                                                        <span className="text-xs text-slate-500">{f.description}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Chat - Flex grow */}
                                <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <AgentChatInterface
                                        findings={result?.findings}
                                        analysisResult={result}
                                        onHighlightFinding={setActiveFindingId}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mobile: Vertical Tabs */}
                        <div className="lg:hidden flex-1 flex flex-col">
                            <div className="flex gap-2 p-3 bg-white border-b border-slate-200">
                                <Button variant={mobileTab === 'image' ? 'default' : 'outline'} onClick={() => setMobileTab('image')} className="flex-1 text-sm">
                                    Image
                                </Button>
                                <Button variant={mobileTab === 'results' ? 'default' : 'outline'} onClick={() => setMobileTab('results')} className="flex-1 text-sm">
                                    Results
                                </Button>
                                <Button variant={mobileTab === 'chat' ? 'default' : 'outline'} onClick={() => setMobileTab('chat')} className="flex-1 text-sm">
                                    Chat
                                </Button>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                {/* Image Tab */}
                                {mobileTab === 'image' && (
                                    <div className="h-full rounded-2xl overflow-hidden border-2 border-slate-200 m-3 mt-0">
                                        <MedicalImageViewer
                                            imageUrl={displayUrl}
                                            findings={result?.findings || []}
                                            isLoading={isLoading}
                                            activeFindingId={activeFindingId}
                                            onFindingClick={setActiveFindingId}
                                        />
                                    </div>
                                )}

                                {/* Results Tab */}
                                {mobileTab === 'results' && (
                                    <div className="h-full overflow-y-auto p-4 space-y-4">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 mb-1">Analysis Results</h3>
                                            <p className="text-xs text-slate-500">Model: {result?.modelUsed} • Confidence: {(result?.confidence * 100).toFixed(1)}%</p>
                                        </div>

                                        {selectedModel === 'both' && result?.metadata?.commonFindings && result?.metadata?.commonFindings.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded inline-block">✓ Common (Both)</h4>
                                                <div className="space-y-2">
                                                    {result?.findings?.filter(f => result?.metadata?.commonFindings?.includes(f.label.toLowerCase())).map((f) => (
                                                        <div key={f.id} className="bg-green-50 rounded-lg p-3 border-l-2 border-green-400 cursor-pointer" onClick={() => setActiveFindingId(f.id)}>
                                                            <div className="flex items-start gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 flex-shrink-0 text-xs font-bold">{(f.confidence * 100).toFixed(0)}%</div>
                                                                <div>
                                                                    <h5 className="font-medium text-sm text-slate-900">{f.label}</h5>
                                                                    <p className="text-xs text-slate-600">{f.description}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedModel === 'both' && result?.metadata?.uncommonFindings && result?.metadata?.uncommonFindings.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded inline-block">⚠ Single Model</h4>
                                                <div className="space-y-2">
                                                    {result?.findings?.filter(f => result?.metadata?.uncommonFindings?.includes(f.label.toLowerCase())).map((f) => (
                                                        <div key={f.id} className="bg-amber-50 rounded-lg p-3 border-l-2 border-amber-400 cursor-pointer" onClick={() => setActiveFindingId(f.id)}>
                                                            <div className="flex items-start gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0 text-xs font-bold">{(f.confidence * 100).toFixed(0)}%</div>
                                                                <div>
                                                                    <h5 className="font-medium text-sm text-slate-900">{f.label}</h5>
                                                                    <p className="text-xs text-slate-600">{f.description}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedModel !== 'both' && (
                                            <div className="space-y-2">
                                                {result?.findings?.map((f) => (
                                                    <div key={f.id} className="bg-blue-50 rounded-lg p-3 border-l-2 border-blue-400 cursor-pointer" onClick={() => setActiveFindingId(f.id)}>
                                                        <div className="flex items-start gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0 text-xs font-bold">{(f.confidence * 100).toFixed(0)}%</div>
                                                            <div>
                                                                <h5 className="font-medium text-sm text-slate-900">{f.label}</h5>
                                                                <p className="text-xs text-slate-600">{f.description}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Chat Tab */}
                                {mobileTab === 'chat' && (
                                    <div className="h-full">
                                        <AgentChatInterface
                                            findings={result?.findings}
                                            analysisResult={result}
                                            onHighlightFinding={setActiveFindingId}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="fixed bottom-6 right-6 z-50 flex gap-2">
                            {!result && (
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={isLoading}
                                    size="sm"
                                    className="shadow-lg"
                                >
                                    {isLoading ? 'Analyzing...' : 'Analyze'}
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                className="shadow-lg"
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
