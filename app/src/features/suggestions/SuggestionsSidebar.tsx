/**
 * SuggestionsSidebar.tsx
 * 
 * Sidebar component for displaying AI-powered writing suggestions.
 * Shows suggestions organized by type with actions.
 */

import { useSuggestionsStore } from './stores/suggestions.store';
import { useEditorStore } from '@/features/editor/stores/editor.store';

/**
 * Suggestions sidebar component
 * Uses the suggestions store directly - no props needed
 */
export function SuggestionsSidebar() {
  const {
    suggestions,
    isAnalyzing,
    error,
    activeTab,
    setActiveTab,
    dismissSuggestion,
    clearAllSuggestions,
    getFilteredSuggestions
  } = useSuggestionsStore();

  const { content, setContent } = useEditorStore();

  const tabs = [
    { id: 'grammar' as const, label: 'Grammar', count: suggestions.filter(s => s.type === 'grammar').length },
    { id: 'style' as const, label: 'Style', count: suggestions.filter(s => s.type === 'style').length },
    { id: 'content' as const, label: 'Content', count: suggestions.filter(s => s.type === 'content').length },
    { id: 'tone' as const, label: 'Tone', count: suggestions.filter(s => s.type === 'tone').length },
  ];

  const filteredSuggestions = getFilteredSuggestions();

  const getTypeIcon = (suggestion: any) => {
    // Check if it's a spelling suggestion based on ID
    if (suggestion.id?.startsWith('spelling-')) {
      return '🔤';
    }
    
    switch (suggestion.type) {
      case 'grammar': return '📝';
      case 'style': return '✨';
      case 'content': return '💡';
      case 'tone': return '🎭';
      default: return '💭';
    }
  };

  // Handle applying a suggestion
  const handleApplySuggestion = (suggestion: any) => {
    if (!suggestion.position || !suggestion.suggested) {
      console.warn('Cannot apply suggestion: missing position or suggested text');
      return;
    }

    const { start, end } = suggestion.position;
    const newContent = 
      content.slice(0, start) + 
      suggestion.suggested + 
      content.slice(end);
    
    setContent(newContent);
    dismissSuggestion(suggestion.id);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Writing Assistant
          </h2>
          {suggestions.length > 0 && (
            <button
              onClick={clearAllSuggestions}
              className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Tabs - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-2 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 text-center ${
                activeTab === tab.id
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <span className="font-medium">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-2 p-3 bg-error-50 border border-error-200 rounded">
          <p className="text-sm text-error-700 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-xs text-error-600 hover:text-error-800 mt-1 transition-colors duration-75"
          >
            Try again
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading State */}
        {isAnalyzing && (
          <div className="p-6 text-center">
            <div className="text-neutral-500 animate-pulse-subtle">Analyzing your writing...</div>
          </div>
        )}

        {/* Empty State */}
        {!isAnalyzing && !error && filteredSuggestions.length === 0 && (
          <div className="p-6 text-center">
            <div className="text-neutral-400 mb-2">✨</div>
            <p className="text-sm text-neutral-600">
              {suggestions.length === 0 
                ? "Start typing to get writing suggestions"
                : `No ${activeTab} suggestions`
              }
            </p>
          </div>
        )}

        {/* Suggestions List */}
        {!isAnalyzing && !error && filteredSuggestions.length > 0 && (
          <div className="p-6 space-y-4">
            {filteredSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="sleek-card rounded-xl p-5 hover:shadow-soft-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                {/* Suggestion Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTypeIcon(suggestion)}</span>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 capitalize">
                        {suggestion.id?.startsWith('spelling-') ? 'Spelling' : suggestion.type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissSuggestion(suggestion.id)}
                    className="text-neutral-400 hover:text-neutral-600 p-1 transition-colors duration-75"
                    title="Dismiss"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Suggestion Content */}
                <div className="space-y-3">
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {suggestion.description}
                  </p>

                  {/* Original Text */}
                  {suggestion.original && (
                    <div className="bg-error-50 border border-error-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-error-800 mb-1">Current:</p>
                      <p className="text-sm text-error-700 font-mono">
                        "{suggestion.original}"
                      </p>
                    </div>
                  )}

                  {/* Suggested Text */}
                  {suggestion.suggested && (
                    <div className="bg-success-50 border border-success-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-success-800 mb-1">Suggested:</p>
                      <p className="text-sm text-success-700 font-mono">
                        "{suggestion.suggested}"
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-2">
                    {suggestion.suggested && (
                      <button
                        onClick={() => handleApplySuggestion(suggestion)}
                        className="sleek-button-secondary text-xs px-3 py-1.5 rounded-lg hover:shadow-soft transition-all duration-200"
                      >
                        Apply
                      </button>
                    )}
                    <button
                      onClick={() => dismissSuggestion(suggestion.id)}
                      className="text-xs text-neutral-500 hover:text-neutral-700 px-3 py-1.5 transition-colors duration-75"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
