
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AVAILABLE_MODELS } from "@/services/imageAnalysis";

interface ModelSelectorProps {
    selectedModel: string;
    onSelect: (modelId: string) => void;
}

export function ModelSelector({ selectedModel, onSelect }: ModelSelectorProps) {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium">AI Model</Label>
            <Select value={selectedModel} onValueChange={onSelect}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                    {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                            {model.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1.5">
                Tip: Select a specialized model for best results (e.g., DenseNet121 for X-Rays).
            </p>
        </div>
    );
}
