
import { cn } from '@/lib/utils';
import {
    GitBranch, Code2, Database, PlayCircle,
    Settings2, ChevronRight, CheckCircle2, Circle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export function WorkflowSidebar() {
    const steps = [
        { id: 1, label: 'Input Source', type: 'input', status: 'completed', icon: Database, detail: 'DICOM Import' },
        { id: 2, label: 'Preprocessing', type: 'process', status: 'completed', icon: Code2, detail: 'CLAHE Normalization' },
        { id: 3, label: 'Segmentation', type: 'ai', status: 'active', icon: GitBranch, detail: 'U-Net Lung Mask' },
        { id: 4, label: 'Classification', type: 'ai', status: 'pending', icon: PlayCircle, detail: 'DenseNet121' },
        { id: 5, label: 'Report Gen', type: 'output', status: 'pending', icon: Settings2, detail: 'Structured JSON' },
    ];

    return (
        <div className="h-full flex flex-col bg-card/50">
            <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Active Pipeline
                </h3>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="relative">
                            {/* Connector Line */}
                            {idx < steps.length - 1 && (
                                <div className="absolute left-[19px] top-10 bottom-[-16px] w-0.5 bg-border/50" />
                            )}

                            <div className={cn(
                                "flex items-start gap-4 p-3 rounded-lg border transition-all",
                                step.status === 'active'
                                    ? "bg-primary/5 border-primary shadow-sm"
                                    : "bg-background border-border"
                            )}>
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 bg-background",
                                    step.status === 'completed' ? "border-green-500 text-green-500" :
                                        step.status === 'active' ? "border-primary text-primary animate-pulse" :
                                            "border-muted text-muted-foreground"
                                )}>
                                    <step.icon className="w-5 h-5" />
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-sm">{step.label}</p>
                                        {step.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                        {step.status === 'active' && <div className="w-2 h-2 rounded-full bg-primary animate-ping" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground font-mono">{step.detail}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-border bg-card/30">
                <div className="text-xs font-mono text-muted-foreground space-y-2">
                    <div className="flex justify-between">
                        <span>Memory Usage:</span>
                        <span className="text-foreground">2.4 GB</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Inference Time:</span>
                        <span className="text-foreground">1.2s</span>
                    </div>
                    <div className="mt-2 w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full w-[65%]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
