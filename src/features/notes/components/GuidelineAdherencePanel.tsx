import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { GuidelineAdherence } from '@/services/textGeneration';

interface GuidelineAdherencePanelProps {
  adherence: GuidelineAdherence;
}

const statusConfig = {
  aligned: { label: 'Aligned', icon: CheckCircle, iconColor: 'text-green-600', color: 'bg-green-100 text-green-800 border-green-200', border: 'border-green-200 bg-green-50' },
  review: { label: 'Review', icon: AlertTriangle, iconColor: 'text-yellow-600', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', border: 'border-yellow-200 bg-yellow-50' },
  deviation: { label: 'Deviation', icon: XCircle, iconColor: 'text-red-600', color: 'bg-red-100 text-red-800 border-red-200', border: 'border-red-200 bg-red-50' },
};

const overallHeaderColor = {
  aligned: 'border-green-200',
  review: 'border-yellow-300',
  deviation: 'border-red-300',
};

export function GuidelineAdherencePanel({ adherence }: GuidelineAdherencePanelProps) {
  const [expanded, setExpanded] = useState(true);

  if (!adherence || adherence.checks.length === 0) return null;

  const overall = statusConfig[adherence.overallStatus] || statusConfig.aligned;
  const OverallIcon = overall.icon;

  return (
    <Card className={`border-2 ${overallHeaderColor[adherence.overallStatus] || 'border-slate-200'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-slate-800">
            <BookOpen className="h-4 w-4" />
            Guideline Adherence
            <Badge variant="outline" className={`text-xs ${overall.color}`}>
              <OverallIcon className="h-3 w-3 mr-1" />
              {overall.label}
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-2 pt-0">
          {adherence.checks.map((check, idx) => {
            const config = statusConfig[check.status as keyof typeof statusConfig] || statusConfig.aligned;
            const Icon = config.icon;
            return (
              <div key={idx} className={`rounded-lg border p-3 ${config.border}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <Icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-slate-900">{check.condition}</span>
                        <Badge variant="outline" className={`text-xs ${config.color}`}>{config.label}</Badge>
                        <span className="text-xs text-slate-500">{check.guidelineRef}</span>
                      </div>
                      {check.deviation && (
                        <p className="text-xs text-slate-700 mt-1">{check.deviation}</p>
                      )}
                      {check.recommendation && (
                        <p className="text-xs text-slate-600 mt-1">
                          <span className="font-semibold">Recommendation: </span>
                          {check.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
