/**
 * spellWorker.ts - Web Worker for spell checking
 * 
 * Handles spell checking operations in a separate thread to avoid blocking
 * the main UI thread. Uses nspell with Hunspell dictionaries for accurate
 * spell checking.
 */

import nspell from 'nspell';

let spell: ReturnType<typeof nspell> | null = null;
let isLoading = false;

/**
 * Load dictionary files from public directory
 */
async function loadDictionary(): Promise<void> {
  if (isLoading || spell !== null) {
    return;
  }
  
  isLoading = true;
  
  try {
    // Load dictionary files from public directory
    // These files are served as static assets and are accessible via HTTP
    const [affResponse, dicResponse] = await Promise.all([
      fetch('/dictionaries/en_US.aff'),
      fetch('/dictionaries/en_US.dic')
    ]);
    
    if (!affResponse.ok || !dicResponse.ok) {
      throw new Error('Failed to load dictionary files');
    }
    
    const affContent = await affResponse.text();
    const dicContent = await dicResponse.text();
    
    // Create spell checker with dictionary data
    spell = nspell(affContent, dicContent);
    
    // Send ready message to main thread
    self.postMessage({
      type: 'ready',
      message: 'Spell checker initialized successfully'
    });
    
  } catch (error) {
    console.error('Failed to load dictionary:', error);
    
    // Send error message to main thread
    self.postMessage({
      type: 'error',
      message: `Failed to initialize spell checker: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  } finally {
    isLoading = false;
  }
}

/**
 * Check spelling of a word
 */
function checkWord(word: string): { correct: boolean; suggestions: string[] } {
  if (!spell) {
    return { correct: true, suggestions: [] };
  }
  
  const correct = spell.correct(word);
  const suggestions = correct ? [] : spell.suggest(word).slice(0, 5); // Limit to 5 suggestions
  
  return { correct, suggestions };
}

/**
 * Process text and find spelling errors
 */
function processText(text: string): Array<{
  word: string;
  index: number;
  length: number;
  suggestions: string[];
}> {
  if (!spell || !text) {
    return [];
  }
  
  const errors: Array<{
    word: string;
    index: number;
    length: number;
    suggestions: string[];
  }> = [];
  
  // Simple word extraction regex
  // This handles basic cases - could be enhanced for more complex text
  const wordRegex = /\b[a-zA-Z]+(?:[''][a-zA-Z]+)?\b/g;
  let match;
  
  while ((match = wordRegex.exec(text)) !== null) {
    const word = match[0];
    const index = match.index;
    
    // Skip very short words and words with numbers
    if (word.length < 3 || /\d/.test(word)) {
      continue;
    }
    
    const result = checkWord(word);
    
    if (!result.correct) {
      errors.push({
        word,
        index,
        length: word.length,
        suggestions: result.suggestions
      });
    }
  }
  
  return errors;
}

/**
 * Handle messages from main thread
 */
self.addEventListener('message', async (event) => {
  const { type, data, requestId } = event.data;
  
  try {
    switch (type) {
      case 'init':
        await loadDictionary();
        break;
        
      case 'checkWord': {
        const { word } = data;
        const result = checkWord(word);
        
        self.postMessage({
          type: 'wordResult',
          requestId,
          data: result
        });
        break;
      }
      
      case 'checkText': {
        const { text } = data;
        
        if (!spell) {
          // If spell checker not ready, initialize it first
          await loadDictionary();
        }
        
        const errors = processText(text);
        
        self.postMessage({
          type: 'textResult',
          requestId,
          data: { errors }
        });
        break;
      }
      
      case 'addWord': {
        const { word } = data;
        if (spell) {
          // TypeScript doesn't recognize the add method but it exists in nspell
          (spell as any).add(word);
        }
        
        self.postMessage({
          type: 'wordAdded',
          requestId,
          data: { word }
        });
        break;
      }
      
      default:
        console.warn('Unknown message type:', type);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      requestId,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Initialize dictionary on worker start
loadDictionary();
