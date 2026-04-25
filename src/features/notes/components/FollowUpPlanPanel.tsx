import { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, CheckSquare, User, AlertOctagon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FollowUpPlan } from '@/services/textGeneration';

interface FollowUpPlanPanelProps {
  followUpPlan: FollowUpPlan;
  followUpDate?: string;
  onAddToEmail?: (instructions: string[]) => void;
}

export function FollowUpPlanPanel({ followUpPlan, followUpDate, onAddToEmail }: FollowUpPlanPanelProps) {
  const [expanded, setExpanded] = useState(true);

  if (!followUpPlan?.rationale && !followUpPlan?.checkItems?.length) return null;

  const intervalLabel = followUpPlan.intervalDays <= 7
    ? `${followUpPlan.intervalDays} days`
    : followUpPlan.intervalDays <= 30
    ? `${Math.round(followUpPlan.intervalDays / 7)} weeks`
    : `${Math.round(followUpPlan.intervalDays / 30)} months`;

  return (
    <Card className="border-2 border-green-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-green-800">
            <Calendar className="h-4 w-4" />
            Follow-Up Plan
            <Badge variant="outline" className="text-xs border-green-300 text-green-700">
              Return in {intervalLabel}
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3 pt-0">
          {followUpDate && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded px-3 py-2">
              <Calendar className="h-4 w-4" />
              <span>Scheduled: <strong>{new Date(followUpDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
            </div>
          )}

          {followUpPlan.rationale && (
            <p className="text-xs text-slate-600 italic border-l-2 border-green-300 pl-2">{followUpPlan.rationale}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {followUpPlan.checkItems.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <CheckSquare className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">Check at Next Visit</span>
                </div>
                <ul className="space-y-0.5">
                  {followUpPlan.checkItems.map((item, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">•</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {followUpPlan.patientInstructions.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <User className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">Patient Instructions</span>
                </div>
                <ul className="space-y-0.5">
                  {followUpPlan.patientInstructions.map((instr, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                      <span className="text-blue-500 mt-0.5">•</span>{instr}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {followUpPlan.urgentReturnSigns.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <div className="flex items-center gap-1 mb-1">
                <AlertOctagon className="h-3 w-3 text-red-600" />
                <span className="text-xs font-semibold text-red-700">Return Urgently If</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {followUpPlan.urgentReturnSigns.map((sign, i) => (
                  <Badge key={i} variant="outline" className="text-xs border-red-300 text-red-700">{sign}</Badge>
                ))}
              </div>
            </div>
          )}

          {onAddToEmail && followUpPlan.patientInstructions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-green-300 text-green-700 hover:bg-green-50"
              onClick={() => onAddToEmail(followUpPlan.patientInstructions)}
            >
              Add Instructions to Patient Email
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
