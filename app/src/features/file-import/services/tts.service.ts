/**
 * tts.service.ts
 * 
 * Frontend service for text-to-speech functionality.
 * Communicates with Supabase Edge Functions for OpenAI TTS integration.
 */

import type { TTSOptions, TTSResult } from '../types/file-import.types';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Text limits
const MAX_TEXT_LENGTH = 4096;

interface TTSRequestOptions extends TTSOptions {
  onProgress?: (progress: number) => void;
}

/**
 * Convert text to speech using OpenAI TTS
 */
export async function synthesizeSpeech(
  text: string, 
  options: Partial<TTSRequestOptions> = {}
): Promise<TTSResult> {
  try {
    // Validate text
    if (!text || text.trim().length === 0) {
      throw new Error('Text is required for speech synthesis');
    }

    if (text.length > MAX_TEXT_LENGTH) {
      throw new Error(`Text length (${text.length}) exceeds maximum limit of ${MAX_TEXT_LENGTH} characters`);
    }

    // Set defaults
    const requestOptions = {
      text: text.trim(),
      voice: options.voice || 'alloy',
      format: options.format || 'mp3',
      speed: options.speed || 1.0
    };

    // Call TTS edge function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/text-to-speech`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestOptions),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `TTS failed with status ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Text-to-speech failed');
    }

    // Create audio blob from data URL
    const audioBlob = await dataUrlToBlob(result.audioUrl);
    const audioUrl = URL.createObjectURL(audioBlob);

    const ttsResult: TTSResult = {
      audioBlob,
      audioUrl,
      duration: result.duration || 0
    };

    return ttsResult;

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Text-to-speech failed: ${error.message}`);
    }
    throw new Error('Text-to-speech failed: Unknown error occurred');
  }
}

/**
 * Convert data URL to Blob
 */
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return await response.blob();
}

/**
 * Validate TTS options
 */
export function validateTTSOptions(options: TTSOptions): void {
  const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  const validFormats = ['mp3', 'opus', 'aac', 'flac'];

  if (options.voice && !validVoices.includes(options.voice)) {
    throw new Error(`Invalid voice: ${options.voice}. Valid options: ${validVoices.join(', ')}`);
  }

  if (options.format && !validFormats.includes(options.format)) {
    throw new Error(`Invalid format: ${options.format}. Valid options: ${validFormats.join(', ')}`);
  }

  if (options.speed !== undefined && (options.speed < 0.25 || options.speed > 4.0)) {
    throw new Error('Speed must be between 0.25 and 4.0');
  }
}

/**
 * Estimate TTS cost (OpenAI charges $0.015 per 1K characters)
 */
export function estimateTTSCost(text: string): number {
  const characterCount = text.length;
  return (characterCount / 1000) * 0.015;
}

/**
 * Split long text into chunks for TTS processing
 */
export function splitTextForTTS(text: string, maxLength: number = MAX_TEXT_LENGTH): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    
    if (currentChunk.length + trimmedSentence.length + 1 <= maxLength) {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk + '.');
      }
      
      // If single sentence is too long, split by words
      if (trimmedSentence.length > maxLength) {
        const words = trimmedSentence.split(' ');
        let wordChunk = '';
        
        for (const word of words) {
          if (wordChunk.length + word.length + 1 <= maxLength) {
            wordChunk += (wordChunk ? ' ' : '') + word;
          } else {
            if (wordChunk) {
              chunks.push(wordChunk);
            }
            wordChunk = word;
          }
        }
        
        if (wordChunk) {
          currentChunk = wordChunk;
        }
      } else {
        currentChunk = trimmedSentence;
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk + '.');
  }
  
  return chunks;
}

/**
 * Process multiple TTS chunks in sequence
 */
export async function synthesizeLongText(
  text: string,
  options: Partial<TTSRequestOptions> = {}
): Promise<TTSResult[]> {
  const chunks = splitTextForTTS(text);
  const results: TTSResult[] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    if (options.onProgress) {
      options.onProgress((i / chunks.length) * 100);
    }
    
    const chunk = chunks[i];
    if (chunk) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { onProgress, ...chunkOptions } = options;
      const result = await synthesizeSpeech(chunk, chunkOptions);
      
      results.push(result);
    }
  }
  
  if (options.onProgress) {
    options.onProgress(100);
  }
  
  return results;
} 
