
import { useState, useCallback } from 'react';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable";
import { WorkflowSidebar } from '@/components/analysis/WorkflowSidebar';
import { MedicalImageViewer } from '@/components/analysis/MedicalImageViewer';
import { AgentChatInterface } from '@/components/analysis/AgentChatInterface';
import { ImageUploader } from '@/components/analysis/ImageUploader';
import { analyzeImage, type AnalysisResult } from '@/services/imageAnalysis';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import type { User, Page } from '@/App';

interface ImageAnalysisPageProps {
    user: User;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
}

export default function ImageAnalysisPage({ user, onNavigate, onLogout }: ImageAnalysisPageProps) {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzeLoading, setIsAnalyzeLoading] = useState(false);
    const [activeFindingId, setActiveFindingId] = useState<string | null>(null);

    const handleFileUpload = (uploadedFile: File | null) => {
        setFile(uploadedFile);
        if (uploadedFile) {
            // Auto-analyze on upload for demo smoothness
            triggerAnalysis(uploadedFile);
        } else {
            setResult(null);
        }
    };

    const triggerAnalysis = async (imgFile: File) => {
        setIsAnalyzeLoading(true);
        try {
            const data = await analyzeImage(imgFile, 'disease-classification', 'densenet121');
            setResult(data);
            toast.success("Analysis Pipeline Completed");
        } catch (e) {
            console.error(e);
            toast.error("Pipeline breakdown");
        } finally {
            setIsAnalyzeLoading(false);
        }
    };

    return (
        <DashboardLayout user={user} currentPage="image-analysis" onNavigate={onNavigate} onLogout={onLogout}>
            <div className="h-[calc(100vh-100px)] min-h-[600px] flex flex-col animate-in fade-in duration-500">
                {!file ? (
                    // Empty State / Upload Screen
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="max-w-2xl w-full">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold tracking-tight mb-2">Rhazys Medical Workspace</h1>
                                <p className="text-muted-foreground">
                                    Initialize a new agentic workflow loop by uploading a DICOM series or medical image.
                                </p>
                            </div>
                            <div className="bg-card border rounded-xl p-8 shadow-sm">
                                <ImageUploader
                                    selectedFile={null}
                                    onFileSelect={handleFileUpload}
                                    resetAnalysis={() => { }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    // Main Workspace Layout
                    <>
                        {/* Desktop View (Resizable Panels) */}
                        <div className="hidden lg:block h-full">
                            <ResizablePanelGroup direction="horizontal" className="rounded-xl border shadow-sm bg-background">
                                {/* Left Sidebar: Workflow */}
                                <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
                                    <WorkflowSidebar />
                                </ResizablePanel>

                                <ResizableHandle />

                                {/* Center: Viewer */}
                                <ResizablePanel defaultSize={50} minSize={30}>
                                    <div className="h-full flex flex-col">
                                        <MedicalImageViewer
                                            imageUrl={result?.imageUrl || (file ? URL.createObjectURL(file) : null)}
                                            findings={result?.findings || []}
                                            isLoading={isAnalyzeLoading}
                                            activeFindingId={activeFindingId}
                                            onFindingClick={setActiveFindingId}
                                        />
                                    </div>
                                </ResizablePanel>

                                <ResizableHandle />

                                {/* Right Sidebar: Chat */}
                                <ResizablePanel defaultSize={30} minSize={20}>
                                    <AgentChatInterface
                                        findings={result?.findings}
                                        onHighlightFinding={setActiveFindingId}
                                    />
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </div>

                        {/* Mobile View (Stacked Cards / Tabs) */}
                        <div className="lg:hidden flex flex-col gap-4 h-full">
                            {/* Viewer is always top priority on mobile */}
                            <div className="flex-1 min-h-[400px]">
                                <MedicalImageViewer
                                    imageUrl={result?.imageUrl || (file ? URL.createObjectURL(file) : null)}
                                    findings={result?.findings || []}
                                    isLoading={isAnalyzeLoading}
                                    activeFindingId={activeFindingId}
                                    onFindingClick={setActiveFindingId}
                                />
                            </div>

                            {/* Chat and Info below */}
                            <div className="h-[400px] border rounded-lg bg-card overflow-hidden">
                                <AgentChatInterface
                                    findings={result?.findings}
                                    onHighlightFinding={setActiveFindingId}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
