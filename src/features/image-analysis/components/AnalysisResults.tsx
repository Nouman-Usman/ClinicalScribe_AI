
import { AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { AnalysisResult } from '@/services/imageAnalysis';

interface AnalysisResultsProps {
    result: AnalysisResult | null;
    isLoading: boolean;
}

export function AnalysisResults({ result, isLoading }: AnalysisResultsProps) {
    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-muted-foreground/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                </div>
                <p className="text-muted-foreground animate-pulse">Analyzing medical image...</p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="h-full flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 p-8">
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center">
                    <FileText className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-xl font-semibold">Ready for Analysis</h3>
                    <p className="text-muted-foreground">Upload a medical image and perform analysis to see results here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Analysis Complete
                </h3>
                <span className="text-sm font-medium px-2 py-1 bg-green-100 text-green-700 rounded-md">
                    Confidence: {(result.confidence * 100).toFixed(1)}%
                </span>
            </div>

            <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Uncertainty Disabled</AlertTitle>
                <AlertDescription>
                    This is an AI-generated analysis. Always verify findings with a qualified medical professional.
                </AlertDescription>
            </Alert>

            <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground uppercase text-xs tracking-wider">Clinical Findings</h4>
                <div className="space-y-3">
                    {result.findings.map((finding, idx) => (
                        <Card key={idx} className="p-4 bg-muted/20 border-l-4 border-l-primary">
                            <p className="text-sm">{finding}</p>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>
                        <span className="font-medium text-foreground">Model Used:</span> {result.modelUsed}
                    </div>
                    <div className="text-right">
                        <span className="font-medium text-foreground">Analysis ID:</span> {result.id.slice(0, 8)}
                    </div>
                </div>
            </div>
        </div>
    );
}
