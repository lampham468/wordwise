/**
 * readability-score.d.ts - Type declarations for readability-score library
 */

declare module 'readability-score' {
  /**
   * Calculate Flesch-Kincaid Grade Level score
   */
  export function fleschKincaid(text: string): number;
  
  /**
   * Calculate Flesch Reading Ease score
   */
  export function fleschReadingEase(text: string): number;
  
  /**
   * Calculate Automated Readability Index
   */
  export function automatedReadabilityIndex(text: string): number;
  
  /**
   * Calculate Coleman-Liau Index
   */
  export function colemanLiauIndex(text: string): number;
  
  /**
   * Calculate Gunning Fog Index
   */
  export function gunningFog(text: string): number;
  
  /**
   * Calculate SMOG Index
   */
  export function smogIndex(text: string): number;
} 
