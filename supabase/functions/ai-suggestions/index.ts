/**
 * AI Suggestions Edge Function
 * 
 * Provides style, tone, and content suggestions using GPT nano
 * for enhanced writing assistance beyond basic grammar/spell checking.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface AISuggestionRequest {
  text: string
  analysisTypes: ('style' | 'tone' | 'content' | 'engagement')[]
  context?: {
    audience?: string
    purpose?: string
    previousDocuments?: string[]
  }
  userId?: string
  documentNumber?: number
}

interface AISuggestion {
  id: string
  type: 'style' | 'tone' | 'content' | 'engagement'
  message: string
  position?: {
    start: number
    end: number
  }
  original?: string
  suggested?: string
  confidence: number
  category: string
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

/**
 * Generate AI suggestions using GPT nano
 */
async function generateAISuggestions(
  text: string,
  analysisTypes: string[],
  context?: AISuggestionRequest['context']
): Promise<AISuggestion[]> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  // Build context-aware prompt
  let systemPrompt = `You are an expert writing assistant. Analyze the given text and provide specific, actionable suggestions to improve writing quality.

Focus on these areas: ${analysisTypes.join(', ')}.

For each suggestion, provide:
1. The specific issue or improvement opportunity
2. The exact text span that needs attention (if applicable)
3. A concrete replacement or improvement
4. A confidence score (0-1)
5. A category (e.g., "clarity", "engagement", "tone")

Respond in JSON format as an array of suggestions.`

  if (context?.audience) {
    systemPrompt += `\n\nTarget audience: ${context.audience}`
  }
  if (context?.purpose) {
    systemPrompt += `\n\nPurpose: ${context.purpose}`
  }

  const userPrompt = `Please analyze this text and provide suggestions:\n\n"${text}"`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using GPT-4o-mini as GPT nano equivalent
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return []
    }

    // Parse the AI response
    const suggestions = parseAIResponse(content, text, analysisTypes)
    return suggestions

  } catch (error) {
    console.error('Error generating AI suggestions:', error)
    throw error
  }
}

/**
 * Parse AI response and convert to structured suggestions
 */
function parseAIResponse(
  aiResponse: string,
  originalText: string,
  analysisTypes: string[]
): AISuggestion[] {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(aiResponse)
    
    if (Array.isArray(parsed)) {
      return parsed.map((item: any, index: number) => ({
        id: crypto.randomUUID(),
        type: item.type || analysisTypes[0] || 'style',
        message: item.message || item.suggestion || 'Improvement suggested',
        position: item.position || findTextPosition(originalText, item.original),
        original: item.original,
        suggested: item.suggested || item.replacement,
        confidence: item.confidence || 0.8,
        category: item.category || 'general'
      }))
    }
  } catch (error) {
    console.warn('Failed to parse AI response as JSON, falling back to text parsing')
  }

  // Fallback: parse as text and create generic suggestions
  const suggestions: AISuggestion[] = []
  const lines = aiResponse.split('\n').filter(line => line.trim())
  
  lines.forEach((line, index) => {
    if (line.includes('suggest') || line.includes('improve') || line.includes('consider')) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: analysisTypes[0] as any || 'style',
        message: line.trim(),
        confidence: 0.7,
        category: 'general'
      })
    }
  })

  return suggestions
}

/**
 * Find position of text in original content
 */
function findTextPosition(text: string, searchText: string): { start: number; end: number } | undefined {
  if (!searchText) return undefined
  
  const index = text.toLowerCase().indexOf(searchText.toLowerCase())
  if (index === -1) return undefined
  
  return {
    start: index,
    end: index + searchText.length
  }
}

/**
 * Save suggestions to database
 */
async function saveSuggestions(
  suggestions: AISuggestion[],
  userId: string,
  documentNumber: number,
  contentHash: string
) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  
  const dbSuggestions = suggestions.map(suggestion => ({
    user_id: userId,
    document_number: documentNumber,
    suggestion_type: suggestion.type,
    range_start: suggestion.position?.start || 0,
    range_end: suggestion.position?.end || 0,
    message: suggestion.message,
    proposed_text: suggestion.suggested,
    engine: 'gpt-4o-mini',
    content_hash: contentHash,
    accepted: null
  }))

  const { error } = await supabase
    .from('suggestions')
    .insert(dbSuggestions)

  if (error) {
    console.error('Error saving suggestions:', error)
    throw error
  }
}

/**
 * Main handler
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, analysisTypes, context, userId, documentNumber }: AISuggestionRequest = await req.json()

    // Validate input
    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!analysisTypes || analysisTypes.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Analysis types are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate content hash for caching
    const contentHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(text)
    ).then(buffer => Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join(''))

    // Generate AI suggestions
    const suggestions = await generateAISuggestions(text, analysisTypes, context)

    // Save to database if user and document info provided
    if (userId && documentNumber) {
      await saveSuggestions(suggestions, userId, documentNumber, contentHash)
    }

    return new Response(
      JSON.stringify({ suggestions, contentHash }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('AI suggestions error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 
