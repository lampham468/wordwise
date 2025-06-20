/**
 * useAudioTranscription.ts
 * 
 * Hook for handling audio and video file transcription.
 * Provides progress tracking and error handling for media files.
 */

import { useCallback, useState } from 'react';
import { transcribeMediaFile, getSupportedMediaTypes } from '../services/media-transcription.service';
import type { TranscriptionResult } from '../types/file-import.types';

interface UseAudioTranscriptionOptions {
  onSuccess?: (result: TranscriptionResult) => void;
  onError?: (error: string) => void;
  language?: string;
  responseFormat?: 'text' | 'verbose_json';
}

interface UseAudioTranscriptionReturn {
  transcribeFile: (file: File) => Promise<TranscriptionResult>;
  isTranscribing: boolean;
  progress: number;
  error: string | null;
  clearError: () => void;
  supportedTypes: string;
}

/**
 * Hook for audio/video transcription
 */
export function useAudioTranscription(
  options: UseAudioTranscriptionOptions = {}
): UseAudioTranscriptionReturn {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const {
    onSuccess,
    onError,
    language = 'en',
    responseFormat = 'verbose_json'
  } = options;

  /**
   * Transcribe a media file
   */
  const transcribeFile = useCallback(async (file: File): Promise<TranscriptionResult> => {
    try {
      setError(null);
      setIsTranscribing(true);
      setProgress(0);

      // Start progress indication
      setProgress(10);

      const result = await transcribeMediaFile(file, {
        language,
        responseFormat,
        onProgress: (progressValue) => {
          // Map progress to 10-90% range (10% for start, 90-100% for completion)
          setProgress(10 + (progressValue * 0.8));
        }
      });

      // Complete progress
      setProgress(100);

      // Handle success callback
      if (onSuccess) {
        onSuccess(result);
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transcription failed';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      throw error;
    } finally {
      setIsTranscribing(false);
      // Keep progress at 100% for a moment before resetting
      setTimeout(() => {
        if (!isTranscribing) {
          setProgress(0);
        }
      }, 1000);
    }
  }, [language, responseFormat, onSuccess, onError]);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    transcribeFile,
    isTranscribing,
    progress,
    error,
    clearError,
    supportedTypes: getSupportedMediaTypes()
  };
} 
