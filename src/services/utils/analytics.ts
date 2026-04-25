export type EventType = 
  | 'analysis_started'
  | 'analysis_completed'
  | 'analysis_failed'
  | 'model_selected'
  | 'export_pdf'
  | 'cache_hit'
  | 'error_retry';

interface AnalyticsEvent {
  type: EventType;
  timestamp: number;
  duration?: number;
  modelUsed?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

const events: AnalyticsEvent[] = [];
const MAX_EVENTS = 100;

export function trackEvent(type: EventType, metadata?: Record<string, any>, duration?: number) {
  const event: AnalyticsEvent = {
    type,
    timestamp: Date.now(),
    metadata,
    duration
  };
  
  events.push(event);
  if (events.length > MAX_EVENTS) events.shift();

  console.log(`[Analytics] ${type}`, { duration, ...metadata });
}

export function trackError(type: EventType, error: Error, metadata?: Record<string, any>) {
  trackEvent(type, { ...metadata, errorMessage: error.message });
}

export function getAnalytics() {
  return {
    totalEvents: events.length,
    analysisCount: events.filter(e => e.type.startsWith('analysis_')).length,
    avgDuration: events
      .filter(e => e.duration)
      .reduce((sum, e) => sum + (e.duration || 0), 0) / events.filter(e => e.duration).length,
    events: events.slice(-20)
  };
}

export function clearAnalytics() {
  events.length = 0;
}
