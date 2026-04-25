
import { AlertCircle, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { AnalysisResult, Finding } from '@/services/imageAnalysis';

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
                <p className="text-muted-foreground animate-pulse">Analyzing medical images...</p>
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
                    <p className="text-muted-foreground">Upload frontal and lateral X-rays to begin analysis</p>
                </div>
            </div>
        );
    }

    const highConfidenceFindings = result.findings.filter(f => f.confidence > 0.5);
    const lowConfidenceFindings = result.findings.filter(f => f.confidence <= 0.5);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Analysis Complete
                </h3>
                <div className="flex gap-2">
                    <Badge variant="secondary">
                        Confidence: {(result.confidence * 100).toFixed(1)}%
                    </Badge>
                    <Badge variant="outline">
                        {result.findings.length} findings
                    </Badge>
                </div>
            </div>

            <Alert variant="destructive" className="bg-yellow-50 text-yellow-900 border-yellow-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Clinical Disclaimer</AlertTitle>
                <AlertDescription>
                    This is an AI-assisted analysis. Always verify findings with a qualified radiologist or medical professional before making clinical decisions.
                </AlertDescription>
            </Alert>

            {highConfidenceFindings.length > 0 && (
                <div className="space-y-4">
                    <h4 className="font-medium text-muted-foreground uppercase text-xs tracking-wider flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        High Confidence Findings
                    </h4>
                    <div className="space-y-3">
                        {highConfidenceFindings.map((finding) => (
                            <FindingCard key={finding.id} finding={finding} />
                        ))}
                    </div>
                </div>
            )}

            {lowConfidenceFindings.length > 0 && (
                <div className="space-y-4">
                    <h4 className="font-medium text-muted-foreground uppercase text-xs tracking-wider flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Low Confidence Findings
                    </h4>
                    <div className="space-y-3">
                        {lowConfidenceFindings.map((finding) => (
                            <FindingCard key={finding.id} finding={finding} />
                        ))}
                    </div>
                </div>
            )}

            {result.processingSteps && result.processingSteps.length > 0 && (
                <details className="p-4 bg-muted/20 rounded-lg border border-border">
                    <summary className="font-medium text-sm cursor-pointer">Processing Steps</summary>
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                        {result.processingSteps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                                <span className="text-primary">→</span>
                                <span>{step}</span>
                            </div>
                        ))}
                    </div>
                </details>
            )}

            <div className="pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>
                        <span className="font-medium text-foreground">Model:</span> {result.modelUsed}
                    </div>
                    <div>
                        <span className="font-medium text-foreground">Time:</span> {result.metadata?.totalTime || 0}ms
                    </div>
                    <div className="col-span-2">
                        <span className="font-medium text-foreground">Analysis ID:</span> {result.id.slice(0, 12)}
                    </div>
                    <div className="col-span-2">
                        <span className="font-medium text-foreground">Timestamp:</span> {new Date(result.timestamp).toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface FindingCardProps {
    finding: Finding;
}

function FindingCard({ finding }: FindingCardProps) {
    const confidencePercent = (finding.confidence * 100).toFixed(1);
    const confidenceColor =
        finding.confidence > 0.7
            ? 'bg-red-500/10 text-red-700 border-red-200'
            : finding.confidence > 0.5
              ? 'bg-orange-500/10 text-orange-700 border-orange-200'
              : 'bg-yellow-500/10 text-yellow-700 border-yellow-200';

    return (
        <Card className={`p-4 border-l-4 ${confidenceColor} bg-transparent`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h5 className="font-semibold text-sm mb-1">{finding.label}</h5>
                    <p className="text-sm text-muted-foreground">{finding.description}</p>
                </div>
                <Badge variant="secondary" className="whitespace-nowrap">
                    {confidencePercent}%
                </Badge>
            </div>
        </Card>
    );
}
