/**
 * media-transcription.service.ts
 * 
 * Frontend service for handling audio and video file transcription.
 * Communicates with Supabase Edge Functions for OpenAI Whisper integration.
 */

import type { 
  TranscriptionResult, 
  FileMetadata
} from '../types/file-import.types';

// Supabase configuration - will be imported from lib/supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface TranscriptionOptions {
  language?: string;
  responseFormat?: 'text' | 'verbose_json';
  temperature?: number;
  onProgress?: (progress: number) => void;
}

/**
 * Transcribe audio or video file to text
 */
export async function transcribeMediaFile(
  file: File, 
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  const startTime = Date.now();
  
  try {
    // Validate file type
    if (!isMediaFile(file)) {
      throw new Error(`Unsupported media file type: ${file.type}`);
    }

    // Validate file size (25MB limit)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit of 25MB`);
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('audio', file);
    
    if (options.language) {
      formData.append('language', options.language);
    }
    
    if (options.responseFormat) {
      formData.append('response_format', options.responseFormat);
    }
    
    if (options.temperature !== undefined) {
      formData.append('temperature', options.temperature.toString());
    }

    // Call transcription edge function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/transcribe-audio`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Transcription failed with status ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Transcription failed');
    }

    // Create metadata
    const processingTime = Date.now() - startTime;
    const confidence = calculateAverageConfidence(result.transcription.segments);
    const metadata: FileMetadata = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      extractedAt: new Date(),
      processingTime,
      duration: result.transcription.duration,
      ...(confidence !== undefined && { confidence })
    };

    // Return transcription result
    const transcriptionResult: TranscriptionResult = {
      content: result.transcription.text,
      metadata,
      language: result.transcription.language,
      segments: result.transcription.segments
    };

    return transcriptionResult;

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Transcription failed: ${error.message}`);
    }
    throw new Error('Transcription failed: Unknown error occurred');
  }
}

/**
 * Check if file is a supported media file
 */
function isMediaFile(file: File): boolean {
  const audioTypes = [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a',
    'audio/webm', 'audio/ogg', 'audio/flac', 'audio/aac'
  ];
  
  const videoTypes = [
    'video/mp4', 'video/avi', 'video/mov', 'video/mkv',
    'video/webm', 'video/quicktime'
  ];

  return audioTypes.includes(file.type) || videoTypes.includes(file.type);
}

/**
 * Calculate average confidence from transcription segments
 */
function calculateAverageConfidence(segments?: Array<{ confidence?: number }>): number | undefined {
  if (!segments || segments.length === 0) return undefined;
  
  const confidenceValues = segments
    .map(s => s.confidence)
    .filter((c): c is number => typeof c === 'number');
    
  if (confidenceValues.length === 0) return undefined;
  
  return confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length;
}

/**
 * Get supported media file types for file input
 */
export function getSupportedMediaTypes(): string {
  return [
    // Audio formats
    '.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.webm',
    // Video formats  
    '.mp4', '.avi', '.mov', '.mkv', '.webm'
  ].join(',');
}

/**
 * Estimate transcription cost (OpenAI charges $0.006 per minute)
 */
export function estimateTranscriptionCost(durationMinutes: number): number {
  return durationMinutes * 0.006;
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 
