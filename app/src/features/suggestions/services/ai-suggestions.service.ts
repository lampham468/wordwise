/**
 * ai-suggestions.service.ts - AI-powered writing suggestions service
 * 
 * Handles communication with the AI suggestions edge function
 * to provide style, tone, and content analysis using GPT nano.
 */

import { supabase } from '@/lib/supabase'
import type { 
  Suggestion, 
  SuggestionType, 
  AISuggestionRequest, 
  AISuggestionResponse,
  AISuggestionContext 
} from '@/types/suggestions'

/**
 * Configuration for AI suggestions
 */
export interface AISuggestionsConfig {
  analysisTypes: SuggestionType[]
  context?: AISuggestionContext
  enableCaching?: boolean
  maxRetries?: number
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: AISuggestionsConfig = {
  analysisTypes: ['style', 'tone', 'engagement'],
  enableCaching: true,
  maxRetries: 2
}

/**
 * Generate AI-powered suggestions for text
 */
export async function generateAISuggestions(
  text: string,
  config: AISuggestionsConfig = DEFAULT_CONFIG
): Promise<Suggestion[]> {
  if (!text.trim()) {
    return []
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  try {
    console.log('🤖 Generating AI suggestions...')
    
    const requestBody: AISuggestionRequest = {
      text,
      analysisTypes: config.analysisTypes,
      ...(config.context && { context: config.context }),
      ...(user?.id && { userId: user.id })
    }

    const { data, error } = await supabase.functions.invoke('ai-suggestions', {
      body: requestBody
    })

    if (error) {
      console.error('AI suggestions error:', error)
      throw new Error(`AI suggestions failed: ${error.message}`)
    }

    const response: AISuggestionResponse = data
    
    console.log(`✅ AI suggestions generated: ${response.suggestions.length} suggestions`)
    return response.suggestions

  } catch (error) {
    console.error('Failed to generate AI suggestions:', error)
    throw error
  }
}

/**
 * Generate style-specific suggestions
 */
export async function generateStyleSuggestions(
  text: string,
  context?: AISuggestionContext
): Promise<Suggestion[]> {
  return generateAISuggestions(text, {
    analysisTypes: ['style'],
    ...(context && { context }),
    enableCaching: true
  })
}

/**
 * Generate tone-specific suggestions
 */
export async function generateToneSuggestions(
  text: string,
  context?: AISuggestionContext
): Promise<Suggestion[]> {
  return generateAISuggestions(text, {
    analysisTypes: ['tone'],
    ...(context && { context }),
    enableCaching: true
  })
}

/**
 * Generate content-specific suggestions
 */
export async function generateContentSuggestions(
  text: string,
  context?: AISuggestionContext
): Promise<Suggestion[]> {
  return generateAISuggestions(text, {
    analysisTypes: ['content'],
    ...(context && { context }),
    enableCaching: true
  })
}

/**
 * Generate engagement-focused suggestions
 */
export async function generateEngagementSuggestions(
  text: string,
  context?: AISuggestionContext
): Promise<Suggestion[]> {
  return generateAISuggestions(text, {
    analysisTypes: ['engagement'],
    ...(context && { context }),
    enableCaching: true
  })
}

/**
 * Generate comprehensive AI analysis (all types)
 */
export async function generateComprehensiveAISuggestions(
  text: string,
  context?: AISuggestionContext
): Promise<Suggestion[]> {
  return generateAISuggestions(text, {
    analysisTypes: ['style', 'tone', 'content', 'engagement'],
    ...(context && { context }),
    enableCaching: true
  })
}

/**
 * Check if AI suggestions are cached and still valid
 */
export async function getCachedAISuggestions(
  userId: string,
  documentNumber: number,
  contentHash: string
): Promise<Suggestion[]> {
  try {
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .eq('user_id', userId)
      .eq('document_number', documentNumber)
      .eq('content_hash', contentHash)
      .in('suggestion_type', ['style', 'tone', 'content', 'engagement'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cached suggestions:', error)
      return []
    }

    return data.map(suggestion => ({
      id: suggestion.id,
      type: suggestion.suggestion_type as SuggestionType,
      category: 'general',
      message: suggestion.message,
             ...(suggestion.range_start !== suggestion.range_end && {
         position: {
           start: suggestion.range_start,
           end: suggestion.range_end
         }
       }),
      suggested: suggestion.proposed_text,
      engine: suggestion.engine,
      accepted: suggestion.accepted,
      createdAt: suggestion.created_at,
      confidence: 0.8 // Default confidence for cached suggestions
    }))

  } catch (error) {
    console.error('Error checking cached suggestions:', error)
    return []
  }
}

/**
 * Mark a suggestion as accepted or rejected
 */
export async function updateSuggestionStatus(
  suggestionId: string,
  accepted: boolean
): Promise<void> {
  try {
    const { error } = await supabase
      .from('suggestions')
      .update({ accepted })
      .eq('id', suggestionId)

    if (error) {
      throw error
    }

    console.log(`Suggestion ${suggestionId} marked as ${accepted ? 'accepted' : 'rejected'}`)
  } catch (error) {
    console.error('Error updating suggestion status:', error)
    throw error
  }
}

/**
 * Build context from previous documents
 */
export async function buildContextFromDocuments(
  userId: string,
  documentNumbers: number[]
): Promise<AISuggestionContext> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('title, content')
      .eq('user_id', userId)
      .in('number', documentNumbers)
      .limit(5) // Limit to prevent token overflow

    if (error) {
      console.error('Error fetching context documents:', error)
      return {}
    }

    const previousDocuments = data.map(doc => 
      `${doc.title}: ${doc.content.substring(0, 500)}...`
    )

    return {
      previousDocuments
    }

  } catch (error) {
    console.error('Error building context:', error)
    return {}
  }
} 
