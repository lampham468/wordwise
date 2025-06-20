/**
 * SpellCheckExtension.ts – TipTap extension for spell check decorations
 * Adds visual indicators for spelling, grammar, and style errors
 */

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { SpellError } from '@/features/editor/hooks/useSpellCheck'

/**
 * Plugin key for spell check decorations
 */
export const spellCheckPluginKey = new PluginKey('spellCheck')

/**
 * Create decorations for spell check errors
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createDecorations(doc: any, errors: SpellError[]): DecorationSet {
  const decorations: Decoration[] = []
  
  for (const error of errors) {
    const { start, end, type = 'spelling' } = error
    
    // Determine CSS class based on error type
    let className = 'spell-error' // Default
    if (type === 'grammar') {
      className = 'grammar-error'
    } else if (type === 'style') {
      className = 'style-suggestion'
    }
    
    // Create decoration
    const decoration = Decoration.inline(start, end, {
      class: className,
      'data-error-type': type,
      'data-error-message': error.message || '',
      'data-error-word': error.word,
      'data-error-suggestions': JSON.stringify(error.suggestions)
    })
    
    decorations.push(decoration)
  }
  
  return DecorationSet.create(doc, decorations)
}

/**
 * Create spell check extension with errors
 */
export function createSpellCheckExtension(errors: SpellError[], onErrorClick?: (error: SpellError) => void) {
  return Extension.create({
    name: 'spellCheck',
    
    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: spellCheckPluginKey,
          
          state: {
            init() {
              return DecorationSet.empty
            },
            
            apply(tr, decorationSet, _oldState, newState) {
              // If the document hasn't changed, map existing decorations
              if (!tr.docChanged) {
                return decorationSet.map(tr.mapping, tr.doc)
              }
              
              // Create new decorations based on current errors
              return createDecorations(newState.doc, errors)
            }
          },
          
          props: {
            decorations(state) {
              return this.getState(state)
            },
            
            handleDOMEvents: {
              click: (_view, event) => {
                if (!onErrorClick) return false
                
                const target = event.target as HTMLElement
                
                // Check if clicked element has spell check data
                if (target.dataset.errorType) {
                  const errorType = target.dataset.errorType as 'spelling' | 'grammar' | 'style'
                  const error: SpellError = {
                    start: 0, // Will be filled by the handler
                    end: 0,   // Will be filled by the handler
                    word: target.dataset.errorWord || '',
                    suggestions: target.dataset.errorSuggestions 
                      ? JSON.parse(target.dataset.errorSuggestions)
                      : [],
                    type: errorType,
                    ...(target.dataset.errorMessage && { message: target.dataset.errorMessage })
                  }
                  
                  onErrorClick(error)
                  return true
                }
                
                return false
              }
            }
          }
        })
      ]
    }
  })
}

export default createSpellCheckExtension 
