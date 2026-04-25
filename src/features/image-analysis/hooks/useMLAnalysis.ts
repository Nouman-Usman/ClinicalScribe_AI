import { useState, useCallback } from 'react';
import { analyzeChestXRay, type ModelSelection } from '@/services/mlModels';
import { MLModelError } from '@/services/mlModels/types';
import type { DualModelAnalysisResult } from '@/services/mlModels/types';

interface UseMLAnalysisOptions {
  onSuccess?: (result: DualModelAnalysisResult) => void;
  onError?: (error: Error) => void;
  maxRetries?: number;
}

interface AnalysisState {
  isLoading: boolean;
  error: Error | null;
  result: DualModelAnalysisResult | null;
  retryCount: number;
  canRetry: boolean;
}

export function useMLAnalysis(options: UseMLAnalysisOptions = {}) {
  const {
    onSuccess,
    onError,
    maxRetries = 2
  } = options;

  const [state, setState] = useState<AnalysisState>({
    isLoading: false,
    error: null,
    result: null,
    retryCount: 0,
    canRetry: true
  });

  const analyze = useCallback(
    async (
      frontalImage: File,
      lateralImage: File,
      modelSelection: ModelSelection = 'both'
    ) => {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      try {
        const result = await analyzeChestXRay(frontalImage, lateralImage, {
          modelSelection,
          execution: 'concurrent'
        });

        setState(prev => ({
          ...prev,
          result,
          isLoading: false,
          retryCount: 0
        }));

        onSuccess?.(result);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        setState(prev => ({
          ...prev,
          error: err,
          isLoading: false,
          canRetry: prev.retryCount < maxRetries
        }));

        onError?.(err);
        throw err;
      }
    },
    [maxRetries, onSuccess, onError]
  );

  const retry = useCallback(
    async (
      frontalImage: File,
      lateralImage: File,
      modelSelection: ModelSelection = 'both'
    ) => {
      if (!state.canRetry) {
        const error = new Error('Max retries exceeded');
        setState(prev => ({
          ...prev,
          error
        }));
        onError?.(error);
        return;
      }

      setState(prev => ({
        ...prev,
        retryCount: prev.retryCount + 1,
        isLoading: true,
        error: null
      }));

      try {
        const result = await analyzeChestXRay(frontalImage, lateralImage, {
          modelSelection,
          execution: 'concurrent'
        });

        setState(prev => ({
          ...prev,
          result,
          isLoading: false
        }));

        onSuccess?.(result);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        setState(prev => ({
          ...prev,
          error: err,
          isLoading: false,
          canRetry: prev.retryCount < maxRetries
        }));

        onError?.(err);
        throw err;
      }
    },
    [state.canRetry, maxRetries, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      result: null,
      retryCount: 0,
      canRetry: true
    });
  }, []);

  return {
    ...state,
    analyze,
    retry,
    reset
  };
}
