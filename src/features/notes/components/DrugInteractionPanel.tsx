import { useState } from 'react';
import { ChevronDown, ChevronUp, Pill, ShieldAlert, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DrugInteraction } from '@/services/textGeneration';

interface DrugInteractionPanelProps {
  interactions: DrugInteraction[];
}

const severityConfig = {
  contraindicated: { label: 'Contraindicated', color: 'bg-red-100 text-red-800 border-red-300', icon: ShieldAlert, iconColor: 'text-red-600', borderColor: 'border-red-300 bg-red-50' },
  major: { label: 'Major', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: AlertTriangle, iconColor: 'text-orange-600', borderColor: 'border-orange-300 bg-orange-50' },
  moderate: { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertTriangle, iconColor: 'text-yellow-600', borderColor: 'border-yellow-300 bg-yellow-50' },
  minor: { label: 'Minor', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Info, iconColor: 'text-blue-600', borderColor: 'border-blue-200 bg-blue-50' },
};

export function DrugInteractionPanel({ interactions }: DrugInteractionPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (!interactions || interactions.length === 0) return null;

  const severeCount = interactions.filter(i => i.severity === 'contraindicated' || i.severity === 'major').length;
  const headerColor = severeCount > 0 ? 'border-red-300' : 'border-yellow-300';

  return (
    <Card className={`border-2 ${headerColor}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-red-800">
            <Pill className="h-4 w-4" />
            Drug Interactions
            {severeCount > 0 && (
              <Badge variant="destructive" className="text-xs">{severeCount} serious</Badge>
            )}
            <Badge variant="outline" className="text-xs">{interactions.length} total</Badge>
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-2 pt-0">
          {interactions
            .sort((a, b) => {
              const order = ['contraindicated', 'major', 'moderate', 'minor'];
              return order.indexOf(a.severity) - order.indexOf(b.severity);
            })
            .map((interaction, idx) => {
              const config = severityConfig[interaction.severity] || severityConfig.minor;
              const Icon = config.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-lg border p-3 cursor-pointer transition-colors ${config.borderColor}`}
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Icon className={`h-4 w-4 flex-shrink-0 ${config.iconColor}`} />
                      <div>
                        <span className="font-medium text-sm text-slate-900">
                          {interaction.drugs.join(' + ')}
                        </span>
                        <Badge variant="outline" className={`ml-2 text-xs ${config.color}`}>
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                    {openIdx === idx ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>

                  {openIdx === idx && (
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="text-slate-700">{interaction.interaction}</p>
                      <p className="text-xs font-semibold text-slate-800 mt-2">Recommendation:</p>
                      <p className="text-xs text-slate-600">{interaction.recommendation}</p>
                    </div>
                  )}
                </div>
              );
            })}
        </CardContent>
      )}
    </Card>
  );
}
