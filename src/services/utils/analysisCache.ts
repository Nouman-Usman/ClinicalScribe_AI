import { AnalysisResult } from '@/services/imageAnalysis';

const CACHE_PREFIX = 'airodx_analysis_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

interface CacheEntry {
  data: AnalysisResult;
  timestamp: number;
}

export function getCachedAnalysis(imageHash: string): AnalysisResult | null {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${imageHash}`);
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(`${CACHE_PREFIX}${imageHash}`);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export function setCachedAnalysis(imageHash: string, result: AnalysisResult): void {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${imageHash}`, JSON.stringify({ data: result, timestamp: Date.now() }));
  } catch (e) {
    console.warn('Cache failed:', e);
  }
}

export function getAnalysisHistory(): AnalysisResult[] {
  try {
    return Object.entries(localStorage)
      .filter(([k]) => k.startsWith(CACHE_PREFIX))
      .map(([, v]) => JSON.parse(v).data)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  } catch {
    return [];
  }
}

export function clearAnalysisCache(): void {
  try {
    Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX)).forEach(k => localStorage.removeItem(k));
  } catch {}
}
