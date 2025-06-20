/**
 * spell-check.d.ts – Type declarations for spell checking libraries
 * Provides TypeScript support for nspell and write-good packages
 */

declare module 'nspell' {
  interface NSpell {
    correct(word: string): boolean
    suggest(word: string): string[]
  }
  
  function nspell(aff: string, dic: string): NSpell
  export = nspell
}

declare module 'write-good' {
  interface WriteGoodSuggestion {
    index: number
    offset: number
    reason: string
  }
  
  interface WriteGoodOptions {
    whitelist?: string[]
    passive?: boolean
    illusion?: boolean
    so?: boolean
    thereIs?: boolean
    weasel?: boolean
    adverb?: boolean
    tooWordy?: boolean
    cliches?: boolean
    eprime?: boolean
  }
  
  function writeGood(text: string, options?: WriteGoodOptions): WriteGoodSuggestion[]
  export = writeGood
}

 
