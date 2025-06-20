/**
 * useSpellCheck.ts – Spell checking hook using Web Workers
 * Provides spell checking functionality with suggestions and error highlighting
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface SpellError {
  word: string
  start: number
  end: number
  suggestions: string[]
  type?: 'spelling' | 'grammar' | 'style'
  message?: string
}

interface SpellCheckOptions {
  enabled?: boolean
  debounceMs?: number
  language?: string
}

interface SpellCheckState {
  errors: SpellError[]
  isReady: boolean
  isChecking: boolean
}

/**
 * Hook for spell checking using Web Workers
 * @param options - Configuration options for spell checking
 * @returns Spell check state and functions
 */
export function useSpellCheck(options: SpellCheckOptions = {}) {
  const {
    enabled = true,
    debounceMs = 500,
    language = 'en'
  } = options

  const [state, setState] = useState<SpellCheckState>({
    errors: [],
    isReady: false,
    isChecking: false
  })

  const workerRef = useRef<Worker | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const lastTextRef = useRef<string>('')

  // Initialize Web Worker
  useEffect(() => {
    if (!enabled) return

    try {
      // Create the spell check worker
      workerRef.current = new Worker(
        new URL('@/workers/spellWorker.ts', import.meta.url),
        { type: 'module' }
      )

      // Handle messages from worker
      workerRef.current.onmessage = (event) => {
        const { type, payload } = event.data

        switch (type) {
          case 'ready':
            setState(prev => ({ ...prev, isReady: true }))
            break

          case 'spell-check-result':
            setState(prev => ({
              ...prev,
              errors: payload.errors || [],
              isChecking: false
            }))
            break

          case 'error':
            console.error('Spell check worker error:', payload)
            setState(prev => ({ ...prev, isChecking: false }))
            break
        }
      }

      // Handle worker errors
      workerRef.current.onerror = (error) => {
        console.error('Spell check worker error:', error)
        setState(prev => ({ ...prev, isReady: false, isChecking: false }))
      }

      // Initialize the worker with language
      workerRef.current.postMessage({
        type: 'init',
        payload: { language }
      })

    } catch (error) {
      console.error('Failed to create spell check worker:', error)
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [enabled, language])

  // Check text for spelling errors
  const checkText = useCallback((text: string) => {
    if (!enabled || !workerRef.current || !state.isReady) {
      return
    }

    // Skip if text hasn't changed
    if (text === lastTextRef.current) {
      return
    }

    lastTextRef.current = text

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce the spell check
    debounceRef.current = setTimeout(() => {
      if (workerRef.current && state.isReady) {
        setState(prev => ({ ...prev, isChecking: true }))
        
        workerRef.current.postMessage({
          type: 'spell-check',
          payload: { text }
        })
      }
    }, debounceMs)
  }, [enabled, state.isReady, debounceMs])

  // Add word to personal dictionary
  const addToDictionary = useCallback((word: string) => {
    if (!workerRef.current || !state.isReady) return

    workerRef.current.postMessage({
      type: 'add-to-dictionary',
      payload: { word }
    })

    // Remove the word from current errors
    setState(prev => ({
      ...prev,
      errors: prev.errors.filter(error => error.word.toLowerCase() !== word.toLowerCase())
    }))
  }, [state.isReady])

  // Ignore word for this session
  const ignoreWord = useCallback((word: string) => {
    setState(prev => ({
      ...prev,
      errors: prev.errors.filter(error => error.word.toLowerCase() !== word.toLowerCase())
    }))
  }, [])

  // Replace word with suggestion
  const replaceWord = useCallback((error: SpellError, replacement: string) => {
    // Remove the error from the list
    setState(prev => ({
      ...prev,
      errors: prev.errors.filter(e => e !== error)
    }))

    // Return the replacement info for the caller to handle
    return {
      start: error.start,
      end: error.end,
      replacement
    }
  }, [])

  // Clear all errors
  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: [] }))
  }, [])

  return {
    errors: state.errors,
    isReady: state.isReady,
    isChecking: state.isChecking,
    checkText,
    addToDictionary,
    ignoreWord,
    replaceWord,
    clearErrors
  }
} 
