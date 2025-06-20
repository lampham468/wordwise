/**
 * suggestions.store.ts - Suggestions state management
 * 
 * Manages AI-generated suggestions, analysis state, and suggestion actions.
 * This store is owned by the suggestions feature.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Suggestion } from '@/types/suggestions';

interface SuggestionsState {
  // Core state
  suggestions: Suggestion[];
  isAnalyzing: boolean;
  error: string | null;
  activeTab: 'all' | 'grammar' | 'style' | 'content' | 'tone';
  
  // Actions
  setSuggestions: (suggestions: Suggestion[]) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setError: (error: string | null) => void;
  setActiveTab: (tab: 'all' | 'grammar' | 'style' | 'content' | 'tone') => void;
  
  // Suggestion actions
  dismissSuggestion: (suggestionId: string) => void;
  clearAllSuggestions: () => void;
  
  // Filtered suggestions
  getFilteredSuggestions: () => Suggestion[];
}

/**
 * Suggestions store for managing AI suggestions state
 */
export const useSuggestionsStore = create<SuggestionsState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    suggestions: [],
    isAnalyzing: false,
    error: null,
    activeTab: 'all',

    // Set suggestions
    setSuggestions: (suggestions) => {
      set({ suggestions, error: null });
    },

    // Set analyzing state
    setAnalyzing: (isAnalyzing) => {
      set({ isAnalyzing });
    },

    // Set error
    setError: (error) => {
      set({ error, isAnalyzing: false });
    },

    // Set active tab
    setActiveTab: (activeTab) => {
      set({ activeTab });
    },

    // Dismiss a suggestion
    dismissSuggestion: (suggestionId) => {
      set(state => ({
        suggestions: state.suggestions.filter(s => s.id !== suggestionId)
      }));
    },

    // Clear all suggestions
    clearAllSuggestions: () => {
      set({ suggestions: [], error: null });
    },

    // Get filtered suggestions based on active tab
    getFilteredSuggestions: () => {
      const { suggestions, activeTab } = get();
      if (activeTab === 'all') return suggestions;
      return suggestions.filter(suggestion => suggestion.type === activeTab);
    }
  }))
); 
