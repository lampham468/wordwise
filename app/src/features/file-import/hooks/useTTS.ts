/**
 * useTTS.ts
 * 
 * Hook for text-to-speech functionality.
 * Provides audio synthesis with progress tracking and playback controls.
 */

import { useCallback, useState, useRef, useEffect } from 'react';
import { 
  synthesizeSpeech, 
  synthesizeLongText, 
  validateTTSOptions, 
  estimateTTSCost 
} from '../services/tts.service';
import type { TTSOptions, TTSResult } from '../types/file-import.types';

interface UseTTSOptions extends TTSOptions {
  onSuccess?: (result: TTSResult | TTSResult[]) => void;
  onError?: (error: string) => void;
  autoPlay?: boolean;
}

interface UseTTSReturn {
  synthesize: (text: string) => Promise<TTSResult | TTSResult[]>;
  play: (audioUrl?: string) => void;
  pause: () => void;
  stop: () => void;
  isPlaying: boolean;
  isSynthesizing: boolean;
  progress: number;
  error: string | null;
  currentAudio: HTMLAudioElement | null;
  estimatedCost: (text: string) => number;
  clearError: () => void;
}

/**
 * Hook for text-to-speech functionality
 */
export function useTTS(options: Partial<UseTTSOptions> = {}): UseTTSReturn {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    onSuccess,
    onError,
    autoPlay = false,
    ...ttsOptions
  } = options;

  /**
   * Clean up audio on unmount
   */
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  /**
   * Synthesize text to speech
   */
  const synthesize = useCallback(async (text: string): Promise<TTSResult | TTSResult[]> => {
    try {
      setError(null);
      setIsSynthesizing(true);
      setProgress(0);

      // Validate options
      validateTTSOptions(ttsOptions);

      // Check text length and decide on processing method
      const maxLength = 4096;
      let result: TTSResult | TTSResult[];

      if (text.length <= maxLength) {
        // Single synthesis
        setProgress(50);
        result = await synthesizeSpeech(text, {
          ...ttsOptions,
          onProgress: (progressValue) => {
            setProgress(50 + (progressValue * 0.5));
          }
        });
      } else {
        // Multiple chunks
        result = await synthesizeLongText(text, {
          ...ttsOptions,
          onProgress: (progressValue) => {
            setProgress(progressValue);
          }
        });
      }

      setProgress(100);

      // Auto-play if enabled
      if (autoPlay && !Array.isArray(result)) {
        play(result.audioUrl);
      }

      // Handle success callback
      if (onSuccess) {
        onSuccess(result);
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Speech synthesis failed';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      throw error;
    } finally {
      setIsSynthesizing(false);
      // Reset progress after a moment
      setTimeout(() => {
        if (!isSynthesizing) {
          setProgress(0);
        }
      }, 1000);
    }
  }, [ttsOptions, autoPlay, onSuccess, onError]);

  /**
   * Play audio
   */
  const play = useCallback((audioUrl?: string) => {
    try {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        setCurrentAudio(audio);

        // Set up event listeners
        audio.addEventListener('play', () => setIsPlaying(true));
        audio.addEventListener('pause', () => setIsPlaying(false));
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          setCurrentAudio(null);
        });
        audio.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          setError('Audio playback failed');
          setIsPlaying(false);
          setCurrentAudio(null);
        });

        // Start playback
        audio.play().catch(error => {
          console.error('Failed to play audio:', error);
          setError('Failed to start audio playback');
          setIsPlaying(false);
        });
      } else if (audioRef.current) {
        // Resume current audio
        audioRef.current.play().catch(error => {
          console.error('Failed to resume audio:', error);
          setError('Failed to resume audio playback');
        });
      }
    } catch (error) {
      console.error('Play error:', error);
      setError('Audio playback failed');
    }
  }, []);

  /**
   * Pause audio
   */
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  /**
   * Stop audio
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  }, []);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    synthesize,
    play,
    pause,
    stop,
    isPlaying,
    isSynthesizing,
    progress,
    error,
    currentAudio,
    estimatedCost: estimateTTSCost,
    clearError
  };
} 
