/**
 * writing.service.ts - Combined writing analysis service
 * 
 * Coordinates between grammar checking (write-good), spell checking (nspell),
 * and AI-powered suggestions to provide comprehensive writing assistance.
 */

import { analyzeGrammar } from './grammar.service';
import { analyzeSpelling } from './spell.service';
import { generateAISuggestions, type AISuggestionsConfig } from './ai-suggestions.service';
import type { Suggestion, SuggestionType, AISuggestionContext, WritingAnalysisResult } from '@/types/suggestions';

/**
 * Configuration for comprehensive writing analysis
 */
interface WritingConfig {
  grammar?: {
    enabled?: boolean;
    checks?: {
      passive?: boolean;
      illusion?: boolean;
      so?: boolean;
      thereIs?: boolean;
      weasel?: boolean;
      adverb?: boolean;
      tooWordy?: boolean;
      cliches?: boolean;
      eprime?: boolean;
    };
    whitelist?: string[];
  };
  spelling?: {
    enabled?: boolean;
    maxSuggestions?: number;
    minWordLength?: number;
  };
  ai?: {
    enabled?: boolean;
    analysisTypes?: SuggestionType[];
    context?: AISuggestionContext;
    enableCaching?: boolean;
  };
}

/**
 * Default configuration for writing analysis
 */
const DEFAULT_CONFIG: WritingConfig = {
  grammar: {
    enabled: true,
    checks: {
      passive: true,
      illusion: true,
      so: true,
      thereIs: true,
      weasel: true,
      adverb: true,
      tooWordy: true,
      cliches: true,
      eprime: false,
    },
    whitelist: [],
  },
  spelling: {
    enabled: true,
    maxSuggestions: 5,
    minWordLength: 3,
  },
  ai: {
    enabled: true,
    analysisTypes: ['style', 'tone', 'engagement'],
    enableCaching: true,
  },
};

/**
 * Analyzes text for grammar, spelling, and AI-powered suggestions
 */
export async function analyzeWriting(text: string, config: WritingConfig = DEFAULT_CONFIG): Promise<WritingAnalysisResult> {
  if (!text.trim()) {
    return {
      suggestions: [],
      stats: {
        total: 0,
        byType: {} as Record<SuggestionType, number>,
        confidence: 0
      }
    };
  }

  const suggestions: Suggestion[] = [];
  const startTime = performance.now();

  try {
    // Run basic analysis (grammar + spelling) first - these are fast
    const basicAnalysisPromises: Promise<Suggestion[]>[] = [];

    // Grammar analysis (synchronous, wrapped in Promise for consistency)
    if (config.grammar?.enabled !== false) {
      console.log('🔍 Running grammar analysis...');
      basicAnalysisPromises.push(
        Promise.resolve(analyzeGrammar(text, config.grammar))
      );
    }

    // Spell checking (asynchronous)
    if (config.spelling?.enabled !== false) {
      console.log('🔍 Running spell checking...');
      basicAnalysisPromises.push(analyzeSpelling(text));
    }

    // AI analysis (asynchronous, potentially slower)
    if (config.ai?.enabled !== false) {
      console.log('🤖 Running AI analysis...');
      const aiConfig: AISuggestionsConfig = {
        analysisTypes: config.ai?.analysisTypes || ['style', 'tone', 'engagement'],
        enableCaching: config.ai?.enableCaching ?? true,
        ...(config.ai?.context && { context: config.ai.context })
      };
      basicAnalysisPromises.push(generateAISuggestions(text, aiConfig));
    }

    // Wait for all analyses to complete
    const results = await Promise.allSettled(basicAnalysisPromises);
    
    // Collect successful results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        suggestions.push(...result.value);
      } else {
        const analysisType = index === 0 ? 'grammar' : 
                           index === 1 ? 'spelling' : 'AI';
        console.warn(`${analysisType} analysis failed:`, result.reason);
      }
    });

    // Sort suggestions by position for consistent ordering
    suggestions.sort((a, b) => {
      if (!a.position || !b.position) return 0;
      return a.position.start - b.position.start;
    });

    // Calculate stats
    const stats = calculateAnalysisStats(suggestions);
    
    const endTime = performance.now();
    console.log(`✅ Writing analysis complete: ${suggestions.length} suggestions found in ${Math.round(endTime - startTime)}ms`);
    
    return {
      suggestions,
      stats
    };

  } catch (error) {
    console.error('Writing analysis failed:', error);
    throw error;
  }
}

/**
 * Analyzes only grammar issues (synchronous)
 */
export function analyzeGrammarOnly(text: string, config?: WritingConfig['grammar']): Suggestion[] {
  return analyzeGrammar(text, config);
}

/**
 * Analyzes only spelling issues (asynchronous)
 */
export async function analyzeSpellingOnly(text: string): Promise<Suggestion[]> {
  return analyzeSpelling(text);
}

/**
 * Analyzes only AI-powered suggestions (asynchronous)
 */
export async function analyzeAIOnly(
  text: string, 
  config?: WritingConfig['ai']
): Promise<Suggestion[]> {
  if (!config?.enabled) return [];
  
     const aiConfig: AISuggestionsConfig = {
     analysisTypes: config?.analysisTypes || ['style', 'tone', 'engagement'],
     enableCaching: config?.enableCaching ?? true,
     ...(config?.context && { context: config.context })
   };
  
  return generateAISuggestions(text, aiConfig);
}

/**
 * Fast analysis (grammar + spelling only, no AI)
 */
export async function analyzeFast(text: string, config?: Omit<WritingConfig, 'ai'>): Promise<WritingAnalysisResult> {
  return analyzeWriting(text, {
    ...config,
    ai: { enabled: false }
  });
}

/**
 * Comprehensive analysis (all suggestion types including AI)
 */
export async function analyzeComprehensive(
  text: string, 
  context?: AISuggestionContext,
  config?: WritingConfig
): Promise<WritingAnalysisResult> {
  return analyzeWriting(text, {
    ...config,
         ai: {
       enabled: true,
       analysisTypes: ['style', 'tone', 'content', 'engagement'],
       ...(context && { context }),
       enableCaching: true,
       ...config?.ai
     }
  });
}

/**
 * Calculate analysis statistics
 */
function calculateAnalysisStats(suggestions: Suggestion[]): WritingAnalysisResult['stats'] {
  const byType: Record<SuggestionType, number> = {
    grammar: 0,
    spelling: 0,
    style: 0,
    tone: 0,
    content: 0,
    engagement: 0
  };

  let totalConfidence = 0;
  let confidenceCount = 0;

  suggestions.forEach(suggestion => {
    byType[suggestion.type]++;
    
    if (suggestion.confidence) {
      totalConfidence += suggestion.confidence;
      confidenceCount++;
    }
  });

  const averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;

  return {
    total: suggestions.length,
    byType,
    confidence: averageConfidence
  };
}

/**
 * Applies a suggestion to text based on its type
 */
export function applySuggestion(suggestion: Suggestion, text: string): string {
  if (!suggestion.position || !suggestion.original) {
    return text;
  }

  const { start, end } = suggestion.position;
  const before = text.substring(0, start);
  const after = text.substring(end);
  
  // Use the suggested replacement if available
  if (suggestion.suggested) {
    return before + suggestion.suggested + after;
  }
  
  // For grammar issues without suggestions, remove the problematic text
  if (suggestion.type === 'grammar') {
    return before + after;
  }
  
  // For other types without suggestions, keep the original
  return text;
}

/**
 * Filter suggestions by type
 */
export function filterSuggestionsByType(
  suggestions: Suggestion[], 
  types: SuggestionType[]
): Suggestion[] {
  return suggestions.filter(suggestion => types.includes(suggestion.type));
}

/**
 * Get suggestions summary
 */
export function getSuggestionsSummary(suggestions: Suggestion[]): string {
  const stats = calculateAnalysisStats(suggestions);
  
  if (stats.total === 0) {
    return "No issues found - your writing looks great!";
  }

  const parts: string[] = [];
  
  if (stats.byType.grammar > 0) {
    parts.push(`${stats.byType.grammar} grammar issue${stats.byType.grammar !== 1 ? 's' : ''}`);
  }
  
  if (stats.byType.spelling > 0) {
    parts.push(`${stats.byType.spelling} spelling issue${stats.byType.spelling !== 1 ? 's' : ''}`);
  }
  
  const aiSuggestions = stats.byType.style + stats.byType.tone + stats.byType.content + stats.byType.engagement;
  if (aiSuggestions > 0) {
    parts.push(`${aiSuggestions} enhancement suggestion${aiSuggestions !== 1 ? 's' : ''}`);
  }

  return `Found ${parts.join(', ')}`;
} 
