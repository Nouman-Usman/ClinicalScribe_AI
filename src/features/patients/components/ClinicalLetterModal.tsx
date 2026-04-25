import { useState } from 'react';
import { Loader2, FileText, Download, Send, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { generateClinicalLetter, type ClinicalLetterType } from '@/services/textGeneration';
import type { Patient } from '@/App';

interface ClinicalLetterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  doctorName: string;
  doctorSpecialty?: string;
  visitSummary?: string;
}

const LETTER_TYPES: { value: ClinicalLetterType; label: string; description: string }[] = [
  { value: 'referral', label: 'Specialist Referral', description: 'Refer patient to specialist with clinical context' },
  { value: 'priorAuth', label: 'Prior Authorization', description: 'Insurance prior auth for medication or procedure' },
  { value: 'fitnessCert', label: 'Fitness / Clearance Certificate', description: 'Medical clearance for work, school, or sport' },
  { value: 'sickLeave', label: 'Sick Leave Certificate', description: 'Medical certificate of incapacity for work' },
  { value: 'dischargeSummary', label: 'Discharge Summary', description: 'Hospital discharge documentation' },
];

export function ClinicalLetterModal({ open, onOpenChange, patient, doctorName, doctorSpecialty, visitSummary }: ClinicalLetterModalProps) {
  const [letterType, setLetterType] = useState<ClinicalLetterType>('referral');
  const [additionalContext, setAdditionalContext] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const letter = await generateClinicalLetter({
        letterType,
        doctorName,
        doctorSpecialty,
        patientName: patient.name,
        patientAge: patient.age,
        patientGender: patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other',
        diagnoses: patient.diagnoses || [],
        medications: patient.medications || [],
        visitSummary,
        additionalContext: additionalContext || undefined,
      });
      setLetterContent(letter);
    } catch {
      toast.error('Failed to generate letter');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    // Simple text download — integrate with pdfExport.ts for full PDF
    const blob = new Blob([letterContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${letterType}-${patient.name.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Letter downloaded');
  };

  const handleCopyToClipboard = async () => {
    await navigator.clipboard.writeText(letterContent);
    toast.success('Letter copied to clipboard');
  };

  const selectedType = LETTER_TYPES.find(t => t.value === letterType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Clinical Letter Generator — {patient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Letter type selector */}
          <div className="space-y-2">
            <Label>Letter Type</Label>
            <Select value={letterType} onValueChange={(v) => { setLetterType(v as ClinicalLetterType); setLetterContent(''); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LETTER_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    <div>
                      <div className="font-medium">{t.label}</div>
                      <div className="text-xs text-slate-500">{t.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedType && (
              <p className="text-xs text-slate-500">{selectedType.description}</p>
            )}
          </div>

          {/* Additional context */}
          <div className="space-y-2">
            <Label>Additional Context (optional)</Label>
            <Input
              placeholder={letterType === 'referral' ? 'e.g., Refer to Cardiologist for chest pain evaluation' : letterType === 'priorAuth' ? 'e.g., Requesting Humira for refractory Crohn\'s disease' : 'Any specific details to include...'}
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
            />
          </div>

          {/* Generate button */}
          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Letter...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate {selectedType?.label}
              </>
            )}
          </Button>

          {/* Letter output */}
          {letterContent && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Generated Letter</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
              <Textarea
                value={letterContent}
                onChange={(e) => setLetterContent(e.target.value)}
                className="min-h-[350px] font-mono text-sm"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
