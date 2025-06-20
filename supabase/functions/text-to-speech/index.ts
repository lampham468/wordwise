/**
 * Text-to-Speech Edge Function
 * 
 * Converts text to speech using OpenAI TTS API.
 * Supports multiple voices and audio formats.
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// OpenAI API configuration
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';

// Supported voices
const SUPPORTED_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;
type Voice = typeof SUPPORTED_VOICES[number];

// Supported formats
const SUPPORTED_FORMATS = ['mp3', 'opus', 'aac', 'flac'] as const;
type AudioFormat = typeof SUPPORTED_FORMATS[number];

// Text limits
const MAX_TEXT_LENGTH = 4096; // OpenAI's limit for TTS

interface TTSRequest {
  text: string;
  voice?: Voice;
  format?: AudioFormat;
  speed?: number; // 0.25 to 4.0
}

interface TTSResponse {
  audioUrl: string;
  duration?: number;
  metadata: {
    voice: Voice;
    format: AudioFormat;
    speed: number;
    textLength: number;
    processedAt: string;
  };
}

/**
 * Main handler for TTS requests
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

    // Parse request body
    const body = await req.json() as TTSRequest;
    
    // Validate required fields
    if (!body.text || typeof body.text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text field is required and must be a string' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate text length
    if (body.text.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ 
          error: `Text length (${body.text.length}) exceeds maximum limit of ${MAX_TEXT_LENGTH} characters` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Set defaults and validate parameters
    const voice: Voice = body.voice && SUPPORTED_VOICES.includes(body.voice) ? body.voice : 'alloy';
    const format: AudioFormat = body.format && SUPPORTED_FORMATS.includes(body.format) ? body.format : 'mp3';
    const speed = body.speed && body.speed >= 0.25 && body.speed <= 4.0 ? body.speed : 1.0;

    // Prepare OpenAI request
    const openaiRequest = {
      model: 'tts-1', // or 'tts-1-hd' for higher quality
      input: body.text,
      voice: voice,
      response_format: format,
      speed: speed
    };

    // Call OpenAI TTS API
    const openaiResponse = await fetch(OPENAI_TTS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openaiRequest),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI TTS API error:', errorText);
      
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
          error: 'Text-to-speech failed', 
          details: errorText 
        }),
        { 
          status: openaiResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get audio data
    const audioBuffer = await openaiResponse.arrayBuffer();
    
    // Create blob URL (for client-side usage)
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    const audioDataUrl = `data:audio/${format};base64,${audioBase64}`;

    // Calculate estimated duration (rough estimate: ~150 words per minute)
    const wordCount = body.text.split(/\s+/).length;
    const estimatedDuration = (wordCount / 150) * 60; // seconds

    const response: TTSResponse = {
      audioUrl: audioDataUrl,
      duration: estimatedDuration,
      metadata: {
        voice,
        format,
        speed,
        textLength: body.text.length,
        processedAt: new Date().toISOString()
      }
    };

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        ...response
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('TTS error:', error);
    
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
