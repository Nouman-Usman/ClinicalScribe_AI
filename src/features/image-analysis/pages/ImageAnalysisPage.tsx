import { useState, useEffect, useRef, useMemo } from 'react';
import { MedicalImageViewer } from '@/features/image-analysis/components/MedicalImageViewer';
import { AgentChatInterface } from '@/features/image-analysis/components/AgentChatInterface';
import { ImageUploader } from '@/features/image-analysis/components/ImageUploader';
import { ModelSelector } from '@/features/image-analysis/components/ModelSelector';
import { analyzeImage, type AnalysisResult, type ModelId } from '@/services/imageAnalysis';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User as UserIcon, ArrowLeft, Search, Plus, UserPlus, Users, Loader2 } from 'lucide-react';
import type { User, Page, Patient } from '@/App';
import { useDatabase } from '@/hooks/useDatabase';
import { getPatientsByUserId, createPatient, dbPatientToAppPatient } from '@/db/services';
import { createImageAnalysis, getImageAnalysesByPatientId } from '@/db/services/imageAnalysisService';

interface ImageAnalysisPageProps {
    user: User;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
}

export default function ImageAnalysisPage({ user, onNavigate, onLogout }: ImageAnalysisPageProps) {
    // Patient selection state
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [patientSearchQuery, setPatientSearchQuery] = useState('');
    const [isLoadingPatients, setIsLoadingPatients] = useState(false);
    const [showNewPatientDialog, setShowNewPatientDialog] = useState(false);
    const [newPatientForm, setNewPatientForm] = useState({
        name: '',
        age: '',
        gender: 'M' as 'M' | 'F' | 'O',
        phone: '',
        email: '',
    });
    const [isCreatingPatient, setIsCreatingPatient] = useState(false);
    const [patientAnalyses, setPatientAnalyses] = useState<any[]>([]);

    // Image analysis state
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

    // Load patients on mount
    useEffect(() => {
        const loadPatients = async () => {
            if (!user.id) return;
            setIsLoadingPatients(true);
            try {
                const dbPatients = await getPatientsByUserId(user.id);
                const appPatients = dbPatients.map(dbPatientToAppPatient);
                setPatients(appPatients);

                // Auto-select patient if coming from patients page
                const selectedPatientId = sessionStorage.getItem('selectedPatientIdForImageAnalysis');
                if (selectedPatientId) {
                    const patient = appPatients.find(p => p.id === selectedPatientId);
                    if (patient) {
                        setSelectedPatient(patient);
                        sessionStorage.removeItem('selectedPatientIdForImageAnalysis');
                    }
                }
            } catch (err) {
                console.error('Error loading patients:', err);
            } finally {
                setIsLoadingPatients(false);
            }
        };
        loadPatients();
    }, [user.id]);

    // Load patient's image analyses when patient selected
    useEffect(() => {
        const loadAnalyses = async () => {
            if (!selectedPatient?.id) {
                setPatientAnalyses([]);
                return;
            }
            try {
                const analyses = await getImageAnalysesByPatientId(selectedPatient.id);
                setPatientAnalyses(analyses || []);
            } catch (err) {
                console.error('Error loading analyses:', err);
            }
        };
        loadAnalyses();
    }, [selectedPatient]);

    // Filter patients based on search
    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
        p.phone?.includes(patientSearchQuery) ||
        p.email?.toLowerCase().includes(patientSearchQuery.toLowerCase())
    );

    // Handle new patient creation
    const handleCreatePatient = async () => {
        if (!newPatientForm.name.trim()) {
            toast.error('Patient name is required');
            return;
        }

        setIsCreatingPatient(true);
        try {
            const newPatient = await createPatient({
                userId: user.id,
                name: newPatientForm.name.trim(),
                age: newPatientForm.age ? parseInt(newPatientForm.age) : undefined,
                gender: newPatientForm.gender,
                phone: newPatientForm.phone || undefined,
                email: newPatientForm.email || undefined,
                diagnoses: [],
                medications: [],
            });

            if (newPatient) {
                const appPatient = dbPatientToAppPatient(newPatient);
                setPatients([appPatient, ...patients]);
                setSelectedPatient(appPatient);
                setShowNewPatientDialog(false);
                setNewPatientForm({ name: '', age: '', gender: 'M', phone: '', email: '' });
                toast.success(`Patient "${appPatient.name}" created successfully`);
            }
        } catch (err) {
            console.error('Error creating patient:', err);
            toast.error('Failed to create patient');
        } finally {
            setIsCreatingPatient(false);
        }
    };

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

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result;
                if (typeof result === 'string') {
                    resolve(result);
                } else {
                    reject(new Error('Failed to read file'));
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
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

            // Save to database if patient selected
            if (selectedPatient) {
                try {
                    // Convert files to base64 for persistent storage
                    const frontalBase64 = await fileToBase64(frontalFile);
                    const lateralBase64 = await fileToBase64(lateralFile);

                    await createImageAnalysis({
                        userId: user.id,
                        patientId: selectedPatient.id,
                        frontalImageUrl: frontalBase64,
                        lateralImageUrl: lateralBase64,
                        modelUsed: selectedModel,
                        findings: data.findings || [],
                        metadata: data.metadata,
                        confidence: Math.round((data.confidence || 0) * 100),
                    });

                    // Reload patient analyses
                    const analyses = await getImageAnalysesByPatientId(selectedPatient.id);
                    setPatientAnalyses(analyses || []);
                    toast.success('Analysis saved for patient');
                } catch (dbErr) {
                    console.error('Error saving to database:', dbErr);
                    toast.warning('Analysis complete but could not save to patient record');
                }
            }

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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6 sm:space-y-8">
                    {/* Patient Selection - Show when no patient selected */}
                    {!selectedPatient && (
                        <Card className="border-2 border-dashed border-muted-foreground/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Select Patient Before Analysis
                                </CardTitle>
                                <CardDescription>
                                    A patient must be linked to store images and results. Select an existing patient or create a new one.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Search existing patients */}
                                <div className="space-y-2">
                                    <Label>Search Existing Patients</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by name, phone, or email..."
                                            value={patientSearchQuery}
                                            onChange={(e) => setPatientSearchQuery(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                {/* Patient list */}
                                {isLoadingPatients ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        <span className="ml-2 text-muted-foreground">Loading patients...</span>
                                    </div>
                                ) : filteredPatients.length > 0 ? (
                                    <ScrollArea className="h-[280px] rounded-md border">
                                        <div className="p-2 space-y-1">
                                            {filteredPatients.map((p) => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => setSelectedPatient(p)}
                                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <UserIcon className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium truncate">{p.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {p.age && `${p.age} yrs`}
                                                            {p.age && p.gender && ' • '}
                                                            {p.gender && (p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other')}
                                                            {(p.phone || p.email) && ' • '}
                                                            {p.phone || p.email}
                                                        </div>
                                                    </div>
                                                    {p.riskLevel && (
                                                        <Badge
                                                            variant={p.riskLevel === 'high' ? 'destructive' : p.riskLevel === 'medium' ? 'secondary' : 'outline'}
                                                            className="flex-shrink-0"
                                                        >
                                                            {p.riskLevel}
                                                        </Badge>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                ) : patients.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>No patients found</p>
                                        <p className="text-sm">Create a new patient to start analysis</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>No patients match your search</p>
                                        <p className="text-sm">Try a different search term or create a new patient</p>
                                    </div>
                                )}

                                {/* Create new patient button */}
                                <div className="flex items-center gap-2 pt-2">
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="text-xs text-muted-foreground">OR</span>
                                    <div className="flex-1 h-px bg-border" />
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowNewPatientDialog(true)}
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Create New Patient
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Patient Context Header - Show when patient selected */}
                    {selectedPatient && (
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedPatient(null)} title="Change patient">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <Card className="flex-1">
                                <CardContent className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <UserIcon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{selectedPatient.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {selectedPatient.age && `${selectedPatient.age} yrs`}
                                                {selectedPatient.age && selectedPatient.gender && ' • '}
                                                {selectedPatient.gender && (selectedPatient.gender === 'M' ? 'Male' : selectedPatient.gender === 'F' ? 'Female' : 'Other')}
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
                                            Change
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                            {selectedPatient ? `Image Analysis for ${selectedPatient.name}` : 'Medical Image Analysis'}
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {selectedPatient
                                ? 'Upload and analyze chest X-rays for instant AI insights'
                                : 'Select or create a patient to begin image analysis'
                            }
                        </p>
                    </div>

                    {/* Main Content Area */}
                    {selectedPatient && !result && !isLoading ? (
                        // Upload + Analyze Screen (stays visible until analysis completes)
                        <div className="space-y-6">
                            {/* Model Selector - Prominent */}
                            <Card className="border-2 border-primary/20 bg-gradient-to-r from-blue-50 to-cyan-50">
                                <CardHeader>
                                    <CardTitle className="text-lg">Analysis Settings</CardTitle>
                                    <CardDescription>Select model and execution mode before uploading images</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ModelSelector
                                        selectedModel={selectedModel}
                                        onModelChange={setSelectedModel}
                                        executionMode={executionMode}
                                        onExecutionModeChange={setExecutionMode}
                                        compact={false}
                                    />
                                </CardContent>
                            </Card>

                            {/* Image Upload Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Upload X-Ray Images</CardTitle>
                                    <CardDescription>Upload frontal and lateral chest X-rays for analysis</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-4">
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

                                        <div className="bg-cyan-50 rounded-lg border-2 border-cyan-200 p-4">
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
                                </CardContent>
                            </Card>

                            {/* Start Analysis Button - Prominent when images ready */}
                            {hasImages && (
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={isLoading}
                                    className="w-full py-8 text-lg font-semibold medical-gradient"
                                    size="lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Analyzing Images...
                                        </>
                                    ) : (
                                        <>
                                            Start Analysis ({selectedModel})
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    ) : selectedPatient && (result || isLoading) ? (
                        // Results Screen
                        <div className="space-y-6">
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

                            <div className="flex gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                >
                                    New Analysis
                                </Button>
                                <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                                    Change Patient
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Right Sidebar - Historical Analyses */}
                {selectedPatient && (
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="text-base">Previous Analyses</CardTitle>
                                <CardDescription>Stored for {selectedPatient.name}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {patientAnalyses.length > 0 ? (
                                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                        {patientAnalyses.map((analysis) => (
                                            <button
                                                key={analysis.id}
                                                onClick={() => {
                                                    // Load previous analysis
                                                    setResult({
                                                        imageUrl: analysis.frontal_image_url || '',
                                                        modelUsed: analysis.model_used,
                                                        findings: analysis.findings || [],
                                                        metadata: analysis.metadata,
                                                        confidence: (analysis.confidence || 0) / 100,
                                                    });
                                                    // Scroll to results
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="w-full p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                                            >
                                                <div className="text-xs text-slate-500">
                                                    {new Date(analysis.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="text-sm font-medium text-slate-900 line-clamp-2">
                                                    {analysis.findings?.length || 0} findings
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    Model: {analysis.model_used}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <p className="text-xs">No previous analyses</p>
                                        <p className="text-xs mt-2">Analyses will appear here</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* New Patient Dialog */}
            <Dialog open={showNewPatientDialog} onOpenChange={setShowNewPatientDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Create New Patient
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="patientName">Patient Name *</Label>
                            <Input
                                id="patientName"
                                placeholder="Enter patient name"
                                value={newPatientForm.name}
                                onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="patientAge">Age</Label>
                                <Input
                                    id="patientAge"
                                    type="number"
                                    placeholder="Age"
                                    value={newPatientForm.age}
                                    onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="patientGender">Gender</Label>
                                <Select
                                    value={newPatientForm.gender}
                                    onValueChange={(value: 'M' | 'F' | 'O') => setNewPatientForm({ ...newPatientForm, gender: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="M">Male</SelectItem>
                                        <SelectItem value="F">Female</SelectItem>
                                        <SelectItem value="O">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="patientPhone">Phone</Label>
                            <Input
                                id="patientPhone"
                                placeholder="Phone number"
                                value={newPatientForm.phone}
                                onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="patientEmail">Email</Label>
                            <Input
                                id="patientEmail"
                                type="email"
                                placeholder="Email address"
                                value={newPatientForm.email}
                                onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewPatientDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreatePatient} disabled={isCreatingPatient}>
                            {isCreatingPatient ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Patient
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
