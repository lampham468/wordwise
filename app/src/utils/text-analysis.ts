/**
 * text-analysis.ts – Text analysis utilities
 * Functions for analyzing text content (word count, character count, etc.)
 */

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
 * Get text analysis summary
 */
export interface TextAnalysis {
  words: number
  characters: number
  charactersWithSpaces: number
  charactersWithoutSpaces: number
  isEmpty: boolean
}

export function analyzeText(text: string): TextAnalysis {
  const cleanText = stripHtml(text)
  
  return {
    words: countWords(text),
    characters: cleanText.length,
    charactersWithSpaces: cleanText.length,
    charactersWithoutSpaces: cleanText.replace(/\s/g, '').length,
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
