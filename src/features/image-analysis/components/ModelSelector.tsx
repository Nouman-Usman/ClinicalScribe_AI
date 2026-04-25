import { type ModelId } from '@/services/imageAnalysis';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  selectedModel: ModelId;
  onModelChange: (model: ModelId) => void;
  executionMode: 'concurrent' | 'sequential';
  onExecutionModeChange: (mode: 'concurrent' | 'sequential') => void;
  compact?: boolean;
}

const MODEL_INFO = {
  both: { label: 'Dual Analysis', desc: 'Both models (comprehensive)' },
  'pathology-detector': { label: 'Pathology Detector', desc: 'DINO Vision Transformer' },
  remedis: { label: 'REMEDIS Diagnostic', desc: 'Siamese network' }
};

export function ModelSelector({
  selectedModel,
  onModelChange,
  executionMode,
  onExecutionModeChange,
  compact = false
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(!compact);

  if (compact) {
    return (
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full flex justify-between items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-sm">{MODEL_INFO[selectedModel].label}</span>
          <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
        </Button>

        {isOpen && (
          <div className="space-y-2 bg-card p-3 rounded border">
            <RadioGroup value={selectedModel} onValueChange={(v) => {
              onModelChange(v as ModelId);
              setIsOpen(false);
            }}>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="both" />
                  <div className="flex-1">
                    <div className="font-medium text-xs">{MODEL_INFO.both.label}</div>
                    <div className="text-[10px] text-muted-foreground">{MODEL_INFO.both.desc}</div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">Rec.</Badge>
                </Label>

                <Label className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="pathology-detector" />
                  <div className="flex-1">
                    <div className="font-medium text-xs">{MODEL_INFO['pathology-detector'].label}</div>
                    <div className="text-[10px] text-muted-foreground">{MODEL_INFO['pathology-detector'].desc}</div>
                  </div>
                </Label>

                <Label className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="remedis" />
                  <div className="flex-1">
                    <div className="font-medium text-xs">{MODEL_INFO.remedis.label}</div>
                    <div className="text-[10px] text-muted-foreground">{MODEL_INFO.remedis.desc}</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-card/50 rounded-lg border">
      <div>
        <h3 className="font-semibold text-sm mb-3">Analysis Models</h3>
        <RadioGroup value={selectedModel} onValueChange={(v) => onModelChange(v as ModelId)}>
          <div className="space-y-2">
            <Label className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="both" />
              <div className="flex-1">
                <div className="font-medium text-sm">Dual Analysis</div>
                <div className="text-xs text-muted-foreground">Both models (most comprehensive)</div>
              </div>
              <Badge variant="secondary" className="text-xs">Recommended</Badge>
            </Label>

            <Label className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="pathology-detector" />
              <div className="flex-1">
                <div className="font-medium text-sm">Pathology Detector</div>
                <div className="text-xs text-muted-foreground">DINO Vision Transformer (14 diseases)</div>
              </div>
            </Label>

            <Label className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="remedis" />
              <div className="flex-1">
                <div className="font-medium text-sm">REMEDIS Diagnostic</div>
                <div className="text-xs text-muted-foreground">Siamese network (multimodal)</div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {selectedModel === 'both' && (
        <div>
          <h3 className="font-semibold text-sm mb-3">Execution Mode</h3>
          <RadioGroup value={executionMode} onValueChange={(v) => onExecutionModeChange(v as any)}>
            <div className="space-y-2">
              <Label className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="concurrent" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Concurrent</div>
                  <div className="text-xs text-muted-foreground">Run both models in parallel (faster)</div>
                </div>
              </Label>

              <Label className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="sequential" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Sequential</div>
                  <div className="text-xs text-muted-foreground">Run one after other (lower load)</div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  );
}
