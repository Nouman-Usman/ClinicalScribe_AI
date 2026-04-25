import { useState } from 'react';
import { ChevronDown, ChevronUp, Stethoscope, AlertTriangle, FlaskConical, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Differential } from '@/services/textGeneration';

interface DifferentialDiagnosisPanelProps {
  differentials: Differential[];
  onSelectDiagnosis?: (condition: string, icd10: string) => void;
}

const rankColors = ['bg-red-100 text-red-800 border-red-200', 'bg-orange-100 text-orange-800 border-orange-200', 'bg-yellow-100 text-yellow-800 border-yellow-200', 'bg-blue-100 text-blue-800 border-blue-200', 'bg-slate-100 text-slate-800 border-slate-200'];

export function DifferentialDiagnosisPanel({ differentials, onSelectDiagnosis }: DifferentialDiagnosisPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  if (!differentials || differentials.length === 0) return null;

  return (
    <Card className="border-2 border-indigo-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-indigo-800">
            <Stethoscope className="h-4 w-4" />
            Differential Diagnosis
            <Badge variant="outline" className="text-xs border-indigo-300 text-indigo-700">{differentials.length} conditions</Badge>
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-2 pt-0">
          {differentials.map((diff, idx) => (
            <div
              key={idx}
              className={`rounded-lg border p-3 cursor-pointer transition-colors ${openIdx === idx ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200 hover:border-indigo-200'}`}
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${rankColors[idx] || rankColors[4]}`}>
                    #{diff.rank}
                  </span>
                  <div>
                    <span className="font-medium text-sm text-slate-900">{diff.condition}</span>
                    <span className="text-xs text-slate-500 ml-2">{diff.icd10}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onSelectDiagnosis && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                      onClick={(e) => { e.stopPropagation(); onSelectDiagnosis(diff.condition, diff.icd10); }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Use
                    </Button>
                  )}
                  {openIdx === idx ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>
              </div>

              {openIdx === idx && (
                <div className="mt-3 space-y-2 text-sm">
                  <p className="text-slate-700">{diff.reasoning}</p>

                  {diff.redFlags.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        <span className="text-xs font-semibold text-red-700">Red Flags</span>
                      </div>
                      <ul className="space-y-0.5">
                        {diff.redFlags.map((flag, i) => (
                          <li key={i} className="text-xs text-red-700 flex items-start gap-1">
                            <span className="mt-0.5">•</span>{flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {diff.suggestedWorkup.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <FlaskConical className="h-3 w-3 text-blue-500" />
                        <span className="text-xs font-semibold text-blue-700">Suggested Workup</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {diff.suggestedWorkup.map((test, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-blue-200 text-blue-700">{test}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
