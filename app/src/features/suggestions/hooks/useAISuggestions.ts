/**
 * useAISuggestions.ts - React hook for AI-powered writing suggestions
 * 
 * Manages the state and operations for AI-generated style, tone, and content suggestions.
 */

import { useState, useEffect, useCallback } from 'react'
// import { useDebounce } from '@/shared/hooks/useDebounce'
import { 
  generateAISuggestions,
  // generateStyleSuggestions,
  // generateToneSuggestions,
  // generateContentSuggestions,
  // generateEngagementSuggestions,
  // generateComprehensiveAISuggestions,
  getCachedAISuggestions,
  updateSuggestionStatus,
  type AISuggestionsConfig
} from '../services/ai-suggestions.service'
import type { 
  Suggestion, 
  SuggestionType, 
  AISuggestionContext 
} from '@/types/suggestions'

export interface UseAISuggestionsConfig {
  text: string
  analysisTypes?: SuggestionType[]
  context?: AISuggestionContext
  debounceMs?: number
  autoAnalyze?: boolean
  userId?: string
  documentNumber?: number
}

export interface UseAISuggestionsReturn {
  suggestions: Suggestion[]
  isLoading: boolean
  error: string | null
  isAnalyzing: boolean
  
  // Actions
  analyzeFull: () => Promise<void>
  analyzeStyle: () => Promise<void>
  analyzeTone: () => Promise<void>
  analyzeContent: () => Promise<void>
  analyzeEngagement: () => Promise<void>
  acceptSuggestion: (suggestionId: string) => Promise<void>
  rejectSuggestion: (suggestionId: string) => Promise<void>
  clearSuggestions: () => void
  
  // Stats
  totalSuggestions: number
  suggestionsByType: Record<SuggestionType, number>
}

export function useAISuggestions(config: UseAISuggestionsConfig): UseAISuggestionsReturn {
  const {
    text,
    // analysisTypes = ['style', 'tone', 'engagement'],
    context,
    debounceMs = 2000,
    autoAnalyze = false,
    userId,
    documentNumber
  } = config

  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalyzedText, setLastAnalyzedText] = useState<string>('')

  // Simple debounced text state
  const [debouncedText, setDebouncedText] = useState(text)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(text)
    }, debounceMs)
    
    return () => clearTimeout(timer)
  }, [text, debounceMs])

  /**
   * Generate content hash for caching
   */
  const generateContentHash = useCallback(async (content: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }, [])

  /**
   * Check for cached suggestions first
   */
  const checkCachedSuggestions = useCallback(async (content: string): Promise<Suggestion[]> => {
    if (!userId || !documentNumber) return []
    
    try {
      const contentHash = await generateContentHash(content)
      return await getCachedAISuggestions(userId, documentNumber, contentHash)
    } catch (error) {
      console.warn('Failed to check cached suggestions:', error)
      return []
    }
  }, [userId, documentNumber, generateContentHash])

  /**
   * Perform AI analysis with error handling
   */
  const performAnalysis = useCallback(async (
    content: string,
    types: SuggestionType[]
  ): Promise<Suggestion[]> => {
    if (!content.trim()) return []

    setIsAnalyzing(true)
    setError(null)

    try {
      // Check cache first
      const cachedSuggestions = await checkCachedSuggestions(content)
      if (cachedSuggestions.length > 0) {
        console.log('Using cached AI suggestions')
        return cachedSuggestions
      }

      // Generate new suggestions
      const aiConfig: AISuggestionsConfig = {
        analysisTypes: types,
        enableCaching: true,
        ...(context && { context })
      }

      const newSuggestions = await generateAISuggestions(content, aiConfig)
      return newSuggestions

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze text'
      setError(errorMessage)
      console.error('AI analysis failed:', err)
      return []
    } finally {
      setIsAnalyzing(false)
    }
  }, [context, checkCachedSuggestions])

  // Full analysis with all suggestion types
  const analyzeFull = useCallback(async () => {
    if (!text.trim()) return

    setIsLoading(true)
    try {
      const results = await performAnalysis(text, ['style', 'tone', 'content', 'engagement'])
      setSuggestions(results)
      setLastAnalyzedText(text)
    } finally {
      setIsLoading(false)
    }
  }, [text, performAnalysis])

  // Specific analysis types
  const analyzeStyle = useCallback(async () => {
    if (!text.trim()) return
    
    setIsLoading(true)
    try {
      const results = await performAnalysis(text, ['style'])
      setSuggestions(prev => [
        ...prev.filter(s => s.type !== 'style'),
        ...results
      ])
    } finally {
      setIsLoading(false)
    }
  }, [text, performAnalysis])

  const analyzeTone = useCallback(async () => {
    if (!text.trim()) return
    
    setIsLoading(true)
    try {
      const results = await performAnalysis(text, ['tone'])
      setSuggestions(prev => [
        ...prev.filter(s => s.type !== 'tone'),
        ...results
      ])
    } finally {
      setIsLoading(false)
    }
  }, [text, performAnalysis])

  const analyzeContent = useCallback(async () => {
    if (!text.trim()) return
    
    setIsLoading(true)
    try {
      const results = await performAnalysis(text, ['content'])
      setSuggestions(prev => [
        ...prev.filter(s => s.type !== 'content'),
        ...results
      ])
    } finally {
      setIsLoading(false)
    }
  }, [text, performAnalysis])

  const analyzeEngagement = useCallback(async () => {
    if (!text.trim()) return
    
    setIsLoading(true)
    try {
      const results = await performAnalysis(text, ['engagement'])
      setSuggestions(prev => [
        ...prev.filter(s => s.type !== 'engagement'),
        ...results
      ])
    } finally {
      setIsLoading(false)
    }
  }, [text, performAnalysis])

  // Suggestion actions
  const acceptSuggestion = useCallback(async (suggestionId: string) => {
    try {
      await updateSuggestionStatus(suggestionId, true)
      setSuggestions(prev => 
        prev.map(s => 
          s.id === suggestionId 
            ? { ...s, accepted: true }
            : s
        )
      )
    } catch (error) {
      console.error('Failed to accept suggestion:', error)
    }
  }, [])

  const rejectSuggestion = useCallback(async (suggestionId: string) => {
    try {
      await updateSuggestionStatus(suggestionId, false)
      setSuggestions(prev => 
        prev.map(s => 
          s.id === suggestionId 
            ? { ...s, accepted: false }
            : s
        )
      )
    } catch (error) {
      console.error('Failed to reject suggestion:', error)
    }
  }, [])

  const clearSuggestions = useCallback(() => {
    setSuggestions([])
    setError(null)
  }, [])

  // Auto-analyze when text changes (if enabled)
  useEffect(() => {
    if (autoAnalyze && debouncedText && debouncedText !== lastAnalyzedText) {
      analyzeFull()
    }
  }, [debouncedText, autoAnalyze, analyzeFull, lastAnalyzedText])

  // Calculate stats
  const totalSuggestions = suggestions.length
  const suggestionsByType = suggestions.reduce((acc, suggestion) => {
    acc[suggestion.type] = (acc[suggestion.type] || 0) + 1
    return acc
  }, {} as Record<SuggestionType, number>)

  return {
    suggestions,
    isLoading,
    error,
    isAnalyzing,
    
    // Actions
    analyzeFull,
    analyzeStyle,
    analyzeTone,
    analyzeContent,
    analyzeEngagement,
    acceptSuggestion,
    rejectSuggestion,
    clearSuggestions,
    
    // Stats
    totalSuggestions,
    suggestionsByType
  }
} 
