
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FileText, Activity, Settings2, CheckCircle2 } from 'lucide-react';
import { ANALYSIS_TYPES, AnalysisType } from '@/services/imageAnalysis';

interface AnalysisTypeSelectorProps {
    selectedType: string;
    onSelect: (type: AnalysisType) => void;
}

export function AnalysisTypeSelector({ selectedType, onSelect }: AnalysisTypeSelectorProps) {
    const getIcon = (typeIds: string) => {
        switch (typeIds) {
            case 'report-generation':
                return <FileText className="w-5 h-5" />;
            case 'disease-classification':
                return <Activity className="w-5 h-5" />;
            default:
                return <Settings2 className="w-5 h-5" />;
        }
    };

    return (
        <div className="grid gap-3">
            {ANALYSIS_TYPES.map((type) => {
                const isSelected = selectedType === type.id;
                return (
                    <Card
                        key={type.id}
                        className={cn(
                            "relative cursor-pointer transition-all hover:bg-accent/50 p-4 border-2",
                            isSelected
                                ? "border-primary bg-accent/20 shadow-md"
                                : "border-transparent bg-card hover:border-border/50"
                        )}
                        onClick={() => onSelect(type.id as AnalysisType)}
                    >
                        <div className="flex items-start gap-4">
                            <div className={cn(
                                "p-2 rounded-lg",
                                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                                {getIcon(type.id)}
                            </div>
                            <div className="flex-1 space-y-1">
                                <h4 className="font-semibold text-sm">{type.label}</h4>
                                <p className="text-xs text-muted-foreground">{type.description}</p>
                            </div>
                            {isSelected && (
                                <CheckCircle2 className="w-5 h-5 text-primary absolute top-4 right-4" />
                            )}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
