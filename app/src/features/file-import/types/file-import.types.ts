/**
 * file-import.types.ts
 * 
 * Type definitions for file import and content extraction functionality.
 * Supports text files, PDFs, audio, video transcription, and TTS.
 */

export interface FileImportState {
  isProcessing: boolean;
  currentFile: File | null;
  progress: number;
  error: string | null;
  processedFiles: ProcessedFile[];
}

export interface ProcessedFile {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  processedAt: Date;
  extractionResult: TextExtractionResult;
}

export interface TextExtractionResult {
  content: string;
  metadata: FileMetadata;
}

export interface FileMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  extractedAt: Date;
  processingTime?: number;
  pageCount?: number; // For PDFs
  duration?: number; // For audio/video files
  confidence?: number; // For transcription accuracy
}

export interface TranscriptionResult extends TextExtractionResult {
  audioUrl?: string;
  language?: string;
  segments?: TranscriptionSegment[];
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
  confidence: number;
}

export interface TTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number; // 0.25 to 4.0
  format?: 'mp3' | 'opus' | 'aac' | 'flac';
}

export interface TTSResult {
  audioBlob: Blob;
  audioUrl: string;
  duration: number;
}

// Supported file types
export const SUPPORTED_TEXT_TYPES = [
  'text/plain',
  'text/markdown',
  'text/rtf',
  'application/rtf'
] as const;

export const SUPPORTED_PDF_TYPES = [
  'application/pdf'
] as const;

export const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/m4a',
  'audio/webm',
  'audio/ogg'
] as const;

export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/avi',
  'video/mov',
  'video/mkv',
  'video/webm'
] as const;

export type SupportedFileType = 
  | typeof SUPPORTED_TEXT_TYPES[number]
  | typeof SUPPORTED_PDF_TYPES[number]
  | typeof SUPPORTED_AUDIO_TYPES[number]
  | typeof SUPPORTED_VIDEO_TYPES[number];

// File processing status
export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export interface FileUploadProgress {
  file: File;
  status: ProcessingStatus;
  progress: number;
  error?: string;
  result?: TextExtractionResult;
} 
