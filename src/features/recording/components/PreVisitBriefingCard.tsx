import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Loader2, Brain, AlertCircle, MessageSquare, Pill } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PreVisitBriefing } from '@/services/textGeneration';

interface PreVisitBriefingCardProps {
  briefing: PreVisitBriefing | null;
  isLoading: boolean;
  patientName: string;
  onDismiss: () => void;
}

export function PreVisitBriefingCard({ briefing, isLoading, patientName, onDismiss }: PreVisitBriefingCardProps) {
  const [expanded, setExpanded] = useState(true);

  if (!isLoading && !briefing?.patientStory) return null;

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-blue-800">
            <Brain className="h-4 w-4" />
            Pre-Visit Briefing — {patientName}
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3 pt-0">
          {isLoading ? (
            <div className="flex items-center gap-2 text-blue-600 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generating pre-visit briefing...</span>
            </div>
          ) : briefing ? (
            <>
              {/* Patient story */}
              {briefing.patientStory && (
                <p className="text-sm text-slate-700 leading-relaxed border-l-2 border-blue-400 pl-3">
                  {briefing.patientStory}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pending actions */}
                {briefing.pendingActions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <AlertCircle className="h-3 w-3 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-700">Pending Actions</span>
                    </div>
                    <ul className="space-y-1">
                      {briefing.pendingActions.map((action, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                          <span className="text-amber-500 mt-0.5">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested talking points */}
                {briefing.suggestionItems.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <MessageSquare className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-semibold text-green-700">Suggested Topics</span>
                    </div>
                    <ul className="space-y-1">
                      {briefing.suggestionItems.map((item, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                          <span className="text-green-500 mt-0.5">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Medications to review */}
              {briefing.medicationsToReview.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Pill className="h-3 w-3 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-700">Medications to Review</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {briefing.medicationsToReview.map((med, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-purple-300 text-purple-700">
                        {med}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk change */}
              {briefing.riskChanges && (
                <p className="text-xs text-slate-500 italic">{briefing.riskChanges}</p>
              )}
            </>
          ) : null}
        </CardContent>
      )}
    </Card>
  );
}
