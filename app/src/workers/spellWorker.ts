/**
 * spellWorker.ts - Web Worker for spell checking
 * 
 * Handles spell checking operations in a separate thread to avoid blocking
 * the main UI thread. Uses nspell with Hunspell dictionaries for accurate
 * spell checking.
 */

import nspell from 'nspell';

let spell: ReturnType<typeof nspell> | null = null;
let loadPromise: Promise<void> | null = null;

console.log('🔧 Spell worker started');

/**
 * Load dictionary files from public directory
 */
async function loadDictionary(): Promise<void> {
  // If already loaded, return immediately
  if (spell !== null) {
    console.log('✅ Dictionary already loaded');
    return;
  }
  
  // If currently loading, wait for that to complete
  if (loadPromise) {
    console.log('⏳ Waiting for dictionary to load...');
    return loadPromise;
  }
  
  // Start loading
  console.log('🔧 Loading dictionary files...');
  
  loadPromise = (async () => {
    try {
      // Load dictionary files from public directory
      // These files are served as static assets and are accessible via HTTP
      const [affResponse, dicResponse] = await Promise.all([
        fetch('/dictionaries/en_US.aff'),
        fetch('/dictionaries/en_US.dic')
      ]);
      
      console.log('🔧 Dictionary responses:', affResponse.ok, dicResponse.ok);
      
      if (!affResponse.ok || !dicResponse.ok) {
        throw new Error('Failed to load dictionary files');
      }
      
      const affContent = await affResponse.text();
      const dicContent = await dicResponse.text();
      
      console.log('🔧 Dictionary content loaded:', affContent.length, dicContent.length);
      
      // Create spell checker with dictionary data
      spell = nspell(affContent, dicContent);
      
      console.log('✅ Spell checker initialized');
      
      // Send ready message to main thread
      self.postMessage({
        type: 'ready',
        message: 'Spell checker initialized successfully'
      });
      
    } catch (error) {
      console.error('❌ Failed to load dictionary:', error);
      
      // Send error message to main thread
      self.postMessage({
        type: 'error',
        message: `Failed to initialize spell checker: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      loadPromise = null;
    }
  })();
  
  return loadPromise;
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
    console.log('⚠️ No spell checker or text');
    return [];
  }
  
  console.log('🔍 Processing text:', text.substring(0, 50) + '...');
  
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
      console.log('❌ Spelling error:', word, 'at', index, 'suggestions:', result.suggestions);
      errors.push({
        word,
        index,
        length: word.length,
        suggestions: result.suggestions
      });
    }
  }
  
  console.log('📝 Found', errors.length, 'spelling errors');
  return errors;
}

/**
 * Handle messages from main thread
 */
self.addEventListener('message', async (event) => {
  console.log('📨 Worker received message:', event.data);
  const { type, data, requestId } = event.data;
  
  try {
    switch (type) {
      case 'init':
        console.log('🔧 Initializing worker...');
        await loadDictionary();
        break;
        
      case 'checkWord': {
        console.log('🔍 Checking word:', data.word);
        
        // Ensure dictionary is loaded
        await loadDictionary();
        
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
        console.log('🔍 Checking text:', data.text.substring(0, 50) + '...');
        
        // Ensure dictionary is loaded before processing
        await loadDictionary();
        
        const { text } = data;
        const errors = processText(text);
        
        console.log('📤 Sending text result:', errors);
        self.postMessage({
          type: 'textResult',
          requestId,
          data: { errors }
        });
        break;
      }
      
      case 'addWord': {
        // Ensure dictionary is loaded
        await loadDictionary();
        
        const { word } = data;
        if (spell) {
          // TypeScript doesn't recognize the add method but it exists in nspell
          (spell as unknown as { add: (word: string) => void }).add(word);
        }
        
        self.postMessage({
          type: 'wordAdded',
          requestId,
          data: { word }
        });
        break;
      }
      
      default:
        console.warn('❓ Unknown message type:', type);
    }
  } catch (error) {
    console.error('❌ Worker error:', error);
    self.postMessage({
      type: 'error',
      requestId,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Initialize dictionary on worker start
console.log('🔧 Auto-initializing dictionary...');
loadDictionary();
