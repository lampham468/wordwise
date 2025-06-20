/**
 * text-analysis.ts – Text analysis utilities
 * Functions for analyzing text content (word count, character count, readability, etc.)
 */

import { fleschKincaid } from 'readability-score';

/**
 * Remove HTML tags from text
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  const cleanText = stripHtml(text).trim()
  if (!cleanText) return 0
  
  // Split by whitespace and filter out empty strings
  return cleanText.split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Count sentences in text
 */
export function countSentences(text: string): number {
  const cleanText = stripHtml(text).trim()
  if (!cleanText) return 0
  
  // Split by sentence-ending punctuation and filter out empty strings
  return cleanText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length
}

/**
 * Count syllables in a word (approximation)
 */
export function countSyllables(word: string): number {
  word = word.toLowerCase()
  if (word.length <= 3) return 1
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')
  const matches = word.match(/[aeiouy]{1,2}/g)
  const syllables = matches ? matches.length : 1
  
  return Math.max(1, syllables)
}

/**
 * Count total syllables in text
 */
export function countTotalSyllables(text: string): number {
  const cleanText = stripHtml(text).trim()
  if (!cleanText) return 0
  
  const words = cleanText.split(/\s+/).filter(word => word.length > 0)
  return words.reduce((total, word) => {
    // Remove punctuation from word
    const cleanWord = word.replace(/[^a-zA-Z]/g, '')
    return total + countSyllables(cleanWord)
  }, 0)
}

/**
 * Calculate Flesch-Kincaid readability score
 */
export function calculateReadabilityScore(text: string): number {
  const cleanText = stripHtml(text).trim()
  if (!cleanText || cleanText.length < 10) return 0
  
  try {
    // Use the readability-score library for accurate calculation
    const score = fleschKincaid(cleanText)
    return Math.round(score * 10) / 10 // Round to 1 decimal place
  } catch (error) {
    console.warn('Failed to calculate readability score:', error)
    
    // Fallback calculation if library fails
    const words = countWords(text)
    const sentences = countSentences(text)
    const syllables = countTotalSyllables(text)
    
    if (words === 0 || sentences === 0) return 0
    
    const avgSentenceLength = words / sentences
    const avgSyllablesPerWord = syllables / words
    
    // Flesch-Kincaid Grade Level formula
    const score = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59
    return Math.max(0, Math.round(score * 10) / 10)
  }
}

/**
 * Count characters in text (excluding HTML tags)
 */
export function countCharacters(text: string): number {
  return stripHtml(text).length
}

/**
 * Count characters including spaces
 */
export function countCharactersWithSpaces(text: string): number {
  return stripHtml(text).length
}

/**
 * Count characters excluding spaces
 */
export function countCharactersWithoutSpaces(text: string): number {
  return stripHtml(text).replace(/\s/g, '').length
}

/**
 * Get readability level description based on Flesch-Kincaid score
 */
export function getReadabilityLevel(score: number): {
  level: string
  description: string
  color: 'success' | 'warning' | 'error' | 'neutral'
} {
  if (score <= 5) {
    return {
      level: 'Elementary',
      description: '5th grade and below',
      color: 'success'
    }
  } else if (score <= 8) {
    return {
      level: 'Middle School',
      description: '6th-8th grade',
      color: 'success'
    }
  } else if (score <= 12) {
    return {
      level: 'High School',
      description: '9th-12th grade',
      color: 'warning'
    }
  } else if (score <= 16) {
    return {
      level: 'College',
      description: 'College level',
      color: 'warning'
    }
  } else {
    return {
      level: 'Graduate',
      description: 'Graduate level',
      color: 'error'
    }
  }
}

/**
 * Get text analysis summary
 */
export interface TextAnalysis {
  words: number
  characters: number
  charactersWithSpaces: number
  charactersWithoutSpaces: number
  sentences: number
  syllables: number
  readabilityScore: number
  readabilityLevel: ReturnType<typeof getReadabilityLevel>
  isEmpty: boolean
}

export function analyzeText(text: string): TextAnalysis {
  const cleanText = stripHtml(text)
  const words = countWords(text)
  const characters = cleanText.length
  const sentences = countSentences(text)
  const syllables = countTotalSyllables(text)
  const readabilityScore = calculateReadabilityScore(text)
  const readabilityLevel = getReadabilityLevel(readabilityScore)
  
  return {
    words,
    characters,
    charactersWithSpaces: characters,
    charactersWithoutSpaces: cleanText.replace(/\s/g, '').length,
    sentences,
    syllables,
    readabilityScore,
    readabilityLevel,
    isEmpty: cleanText.trim().length === 0
  }
}

/**
 * Format numbers for display (e.g., 1000 -> "1k")
 */
export function formatCount(count: number): string {
  if (count < 1000) return count.toString()
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k`
  return `${(count / 1000000).toFixed(1)}M`
} 
