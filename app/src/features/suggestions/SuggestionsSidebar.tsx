/**
 * SuggestionsSidebar.tsx
 * 
 * Sidebar component for displaying AI-powered writing suggestions.
 * Shows suggestions organized by type with confidence scores and actions.
 */

import { useSuggestionsStore } from './stores/suggestions.store';

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

  const tabs = [
    { id: 'all' as const, label: 'All', count: suggestions.length },
    { id: 'grammar' as const, label: 'Grammar', count: suggestions.filter(s => s.type === 'grammar').length },
    { id: 'style' as const, label: 'Style', count: suggestions.filter(s => s.type === 'style').length },
    { id: 'content' as const, label: 'Content', count: suggestions.filter(s => s.type === 'content').length },
    { id: 'tone' as const, label: 'Tone', count: suggestions.filter(s => s.type === 'tone').length },
  ];

  const filteredSuggestions = getFilteredSuggestions();

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success-600 bg-success-50';
    if (confidence >= 0.6) return 'text-warning-600 bg-warning-50';
    return 'text-error-600 bg-error-50';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'grammar': return '📝';
      case 'style': return '✨';
      case 'content': return '💡';
      case 'tone': return '🎭';
      default: return '💭';
    }
  };

  const handleApplySuggestion = (suggestionId: string) => {
    // TODO: Apply suggestion to editor
    console.log('Applying suggestion:', suggestionId);
    dismissSuggestion(suggestionId);
  };

  return (
    <div className="sidebar-width flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">AI Suggestions</h2>
          {suggestions.length > 0 && (
            <button
              onClick={clearAllSuggestions}
              className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-white/20"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'sleek-card bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow'
                  : 'bg-white/40 text-neutral-600 hover:bg-white/60 hover:shadow-soft'
              }`}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {isAnalyzing ? (
          <div className="p-4 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-neutral-500">Analyzing your text...</p>
          </div>
        ) : error ? (
          <div className="p-4">
            <div className="bg-error-50 border border-error-200 rounded p-3">
              <p className="text-sm text-error-700 leading-relaxed">{error}</p>
            </div>
          </div>
        ) : filteredSuggestions.length === 0 ? (
          <div className="p-4 text-center text-neutral-500">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm">
              {activeTab === 'all' 
                ? 'No suggestions available. Start writing to get AI-powered recommendations!' 
                : `No ${activeTab} suggestions found.`
              }
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {filteredSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="sleek-card rounded-xl p-5 hover:shadow-soft-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                {/* Suggestion Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 capitalize">
                        {suggestion.type}
                      </p>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </div>
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
                <div className="mb-4">
                  <p className="text-sm text-neutral-700 mb-3 leading-relaxed">{suggestion.description}</p>
                  
                  {suggestion.suggested && (
                    <div className="bg-neutral-50 rounded p-3">
                      <div className="text-xs text-neutral-500 mb-1">Suggested change:</div>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-error-600 line-through">{suggestion.original}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-success-600 font-medium">{suggestion.suggested}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {suggestion.suggested && (
                    <button
                      onClick={() => handleApplySuggestion(suggestion.id)}
                      className="sleek-button flex-1 px-4 py-2 text-white text-sm font-medium rounded-lg"
                    >
                      Apply
                    </button>
                  )}
                  <button
                    onClick={() => dismissSuggestion(suggestion.id)}
                    className="flex-1 px-4 py-2 bg-white/60 text-neutral-700 text-sm font-medium rounded-lg hover:bg-white/80 transition-all duration-200 hover:shadow-soft"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
