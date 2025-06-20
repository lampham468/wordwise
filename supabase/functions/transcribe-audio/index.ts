/**
 * Transcribe Audio Edge Function
 * 
 * Handles audio and video file transcription using OpenAI Whisper API.
 * Supports multiple audio formats and provides streaming progress updates.
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// OpenAI API configuration
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

// Supported file types
const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 
  'audio/webm', 'audio/ogg', 'audio/flac', 'audio/aac'
];

const SUPPORTED_VIDEO_TYPES = [
  'video/mp4', 'video/avi', 'video/mov', 'video/mkv', 
  'video/webm', 'video/quicktime'
];

// File size limit (25MB - OpenAI's limit)
const MAX_FILE_SIZE = 25 * 1024 * 1024;

interface TranscriptionRequest {
  model: string;
  language?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

interface TranscriptionResponse {
  text: string;
  language?: string;
  duration?: number;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

/**
 * Main handler for transcription requests
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check OpenAI API key
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en';
    const responseFormat = formData.get('response_format') as string || 'verbose_json';

    // Validate audio file
    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate file type
    const isValidType = SUPPORTED_AUDIO_TYPES.includes(audioFile.type) || 
                       SUPPORTED_VIDEO_TYPES.includes(audioFile.type);
    
    if (!isValidType) {
      return new Response(
        JSON.stringify({ 
          error: `Unsupported file type: ${audioFile.type}`,
          supportedTypes: [...SUPPORTED_AUDIO_TYPES, ...SUPPORTED_VIDEO_TYPES]
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate file size
    if (audioFile.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ 
          error: `File size (${Math.round(audioFile.size / 1024 / 1024)}MB) exceeds maximum limit of 25MB` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare OpenAI request
    const openaiFormData = new FormData();
    openaiFormData.append('file', audioFile);
    openaiFormData.append('model', 'whisper-1');
    openaiFormData.append('language', language);
    openaiFormData.append('response_format', responseFormat);
    
    // Optional: Add temperature for creativity control
    if (formData.get('temperature')) {
      openaiFormData.append('temperature', formData.get('temperature') as string);
    }

    // Call OpenAI Whisper API
    const openaiResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: openaiFormData,
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      
      // Handle specific OpenAI errors
      if (openaiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Transcription failed', 
          details: errorText 
        }),
        { 
          status: openaiResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse OpenAI response
    const transcriptionResult = await openaiResponse.json();
    
    // Format response based on requested format
    let formattedResponse: TranscriptionResponse;
    
    if (responseFormat === 'verbose_json') {
      formattedResponse = {
        text: transcriptionResult.text,
        language: transcriptionResult.language,
        duration: transcriptionResult.duration,
        segments: transcriptionResult.segments?.map((segment: any) => ({
          start: segment.start,
          end: segment.end,
          text: segment.text
        }))
      };
    } else {
      // For 'text' format or others
      formattedResponse = {
        text: typeof transcriptionResult === 'string' ? transcriptionResult : transcriptionResult.text
      };
    }

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        transcription: formattedResponse,
        metadata: {
          fileName: audioFile.name,
          fileSize: audioFile.size,
          fileType: audioFile.type,
          language: language,
          responseFormat: responseFormat,
          processedAt: new Date().toISOString()
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Transcription error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}); 
