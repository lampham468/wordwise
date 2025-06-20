/**
 * spell.service.ts - Spell checking service using nspell
 * 
 * Provides spell checking functionality using the nspell library via Web Worker.
 * Converts spell check results to our internal Suggestion format.
 */

import type { Suggestion } from '@/types/suggestions';

/**
 * Configuration for spell checking
 */
interface SpellConfig {
  enabled?: boolean;
  maxSuggestions?: number;
  minWordLength?: number;
}

/**
 * Default configuration for spell checking
 */
const DEFAULT_CONFIG: SpellConfig = {
  enabled: true,
  maxSuggestions: 5,
  minWordLength: 3,
};

/**
 * Result from spell worker
 */
interface SpellWorkerResult {
  word: string;
  index: number;
  length: number;
  suggestions?: string[];
}

/**
 * Check text with spell worker
 */
async function checkTextWithWorker(text: string): Promise<SpellWorkerResult[]> {
  return new Promise((resolve, reject) => {
    console.log('🔧 Creating spell worker...');
    
    // Use proper Vite worker import
    const worker = new Worker(
      new URL('@/workers/spellWorker.ts', import.meta.url),
      { type: 'module' }
    );
    
    console.log('🔧 Worker created:', worker);
    
    const timeout = setTimeout(() => {
      console.log('⏰ Spell check timeout');
      worker.terminate();
      reject(new Error('Spell check timeout'));
    }, 10000); // 10 second timeout
    
    const requestId = Date.now().toString();
    console.log('🔧 Request ID:', requestId);
    
    worker.onmessage = (e) => {
      console.log('📨 Worker message received:', e.data);
      const { type, requestId: responseId, data } = e.data;
      
      // Only handle messages for our request
      if (responseId === requestId) {
        console.log('✅ Message matches request ID');
        clearTimeout(timeout);
        worker.terminate();
        
        if (type === 'error') {
          console.error('❌ Worker error:', e.data.message);
          reject(new Error(e.data.message));
        } else if (type === 'textResult') {
          console.log('✅ Text result:', data.errors);
          resolve(data.errors || []);
        }
      } else {
        console.log('⚠️ Message ID mismatch:', responseId, 'vs', requestId);
      }
    };
    
    worker.onerror = (error) => {
      console.error('❌ Worker error:', error);
      clearTimeout(timeout);
      worker.terminate();
      reject(error);
    };
    
    // Send text to worker in the expected format
    const message = {
      type: 'checkText',
      requestId,
      data: { text }
    };
    console.log('📤 Sending message to worker:', message);
    worker.postMessage(message);
  });
}

/**
 * Analyzes text for spelling issues using nspell via Web Worker
 */
export async function analyzeSpelling(text: string, _config: SpellConfig = DEFAULT_CONFIG): Promise<Suggestion[]> {
  if (!text.trim()) {
    console.log('⚠️ Empty text, skipping spell check');
    return [];
  }

  try {
    console.log('🔍 Analyzing spelling for text:', text.substring(0, 50) + '...');
    const results: SpellWorkerResult[] = await checkTextWithWorker(text);
    console.log('📝 Spell check results:', results);
    
    // Convert to our Suggestion format
    return results.map((result, index) => {
      const suggestion: Suggestion = {
        id: `spelling-${Date.now()}-${index}`,
        type: 'grammar' as const, // Using 'grammar' type as spelling is part of grammar
        title: 'Spelling Error',
        description: `"${result.word}" may be misspelled`,
        original: result.word,
        position: {
          start: result.index,
          end: result.index + result.length,
        },
      };
      
      // Add suggestion if available
      if (result.suggestions && result.suggestions.length > 0 && result.suggestions[0]) {
        suggestion.suggested = result.suggestions[0]; // Use the first suggestion
      }
      
      return suggestion;
    });
  } catch (error) {
    console.error('Spell analysis failed:', error);
    return [];
  }
}

/**
 * Applies a spelling suggestion to text
 */
export function applySpellingSuggestion(suggestion: Suggestion, text: string): string {
  if (!suggestion.position || !suggestion.original || !suggestion.suggested) {
    return text;
  }

  const { start, end } = suggestion.position;
  const before = text.substring(0, start);
  const after = text.substring(end);
  
  // Replace the misspelled word with the suggestion
  return before + suggestion.suggested + after;
} 
