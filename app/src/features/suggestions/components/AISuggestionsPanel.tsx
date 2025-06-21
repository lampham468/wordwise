/**
 * AISuggestionsPanel.tsx - Panel for displaying AI-powered writing suggestions
 * 
 * Shows style, tone, content, and engagement suggestions with actions to accept/reject
 */

// import React from 'react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Loader2, Sparkles, CheckCircle, XCircle, Brain, MessageSquare, Target, Zap } from 'lucide-react'
import type { Suggestion, SuggestionType } from '@/types/suggestions'

interface AISuggestionsPanelProps {
  suggestions: Suggestion[]
  isLoading: boolean
  isAnalyzing: boolean
  error: string | null
  onAcceptSuggestion: (suggestionId: string) => void
  onRejectSuggestion: (suggestionId: string) => void
  onAnalyzeStyle: () => void
  onAnalyzeTone: () => void
  onAnalyzeContent: () => void
  onAnalyzeEngagement: () => void
  onAnalyzeFull: () => void
  onClearSuggestions: () => void
}

/**
 * Get icon for suggestion type
 */
function getSuggestionIcon(type: SuggestionType) {
  switch (type) {
    case 'style':
      return <Brain className="w-4 h-4" />
    case 'tone':
      return <MessageSquare className="w-4 h-4" />
    case 'content':
      return <Target className="w-4 h-4" />
    case 'engagement':
      return <Zap className="w-4 h-4" />
    default:
      return <Sparkles className="w-4 h-4" />
  }
}

/**
 * Get color for suggestion type
 */
function getSuggestionColor(type: SuggestionType): string {
  switch (type) {
    case 'style':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'tone':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'content':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'engagement':
      return 'bg-orange-50 text-orange-700 border-orange-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

/**
 * Individual suggestion item component
 */
function SuggestionItem({ 
  suggestion, 
  onAccept, 
  onReject 
}: {
  suggestion: Suggestion
  onAccept: (id: string) => void
  onReject: (id: string) => void
}) {
  const isAccepted = suggestion.accepted === true
  const isRejected = suggestion.accepted === false
  const isPending = suggestion.accepted === null

  return (
    <Card className="mb-3 border-l-4 border-l-indigo-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getSuggestionIcon(suggestion.type)}
              <Badge 
                variant="outline" 
                className={getSuggestionColor(suggestion.type)}
              >
                {suggestion.type}
              </Badge>
              {suggestion.confidence && (
                <span className="text-xs text-gray-500">
                  {Math.round(suggestion.confidence * 100)}% confidence
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-800 mb-2">
              {suggestion.message}
            </p>
            
            {suggestion.original && suggestion.suggested && (
              <div className="text-xs space-y-1">
                <div className="bg-red-50 border border-red-200 rounded p-2">
                  <span className="text-red-600 font-medium">Original: </span>
                  <span className="text-red-800">{suggestion.original}</span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-2">
                  <span className="text-green-600 font-medium">Suggested: </span>
                  <span className="text-green-800">{suggestion.suggested}</span>
                </div>
              </div>
            )}
          </div>
          
          {isPending && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAccept(suggestion.id)}
                className="h-8 px-2 text-green-600 hover:bg-green-50"
              >
                <CheckCircle className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(suggestion.id)}
                className="h-8 px-2 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-3 h-3" />
              </Button>
            </div>
          )}
          
          {isAccepted && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Accepted
            </Badge>
          )}
          
          {isRejected && (
            <Badge className="bg-red-100 text-red-800">
              <XCircle className="w-3 h-3 mr-1" />
              Rejected
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Main AI suggestions panel component
 */
export function AISuggestionsPanel({
  suggestions,
  isLoading,
  isAnalyzing,
  error,
  onAcceptSuggestion,
  onRejectSuggestion,
  onAnalyzeStyle,
  onAnalyzeTone,
  onAnalyzeContent,
  onAnalyzeEngagement,
  onAnalyzeFull,
  onClearSuggestions
}: AISuggestionsPanelProps) {
  const aiSuggestions = suggestions.filter(s => 
    ['style', 'tone', 'content', 'engagement'].includes(s.type)
  )

  const suggestionsByType = aiSuggestions.reduce((acc, suggestion) => {
    acc[suggestion.type] = (acc[suggestion.type] || 0) + 1
    return acc
  }, {} as Record<SuggestionType, number>)

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            AI Writing Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Analysis buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button
              onClick={onAnalyzeStyle}
              disabled={isLoading || isAnalyzing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              Style
              {suggestionsByType.style > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 text-xs">
                  {suggestionsByType.style}
                </Badge>
              )}
            </Button>
            
            <Button
              onClick={onAnalyzeTone}
              disabled={isLoading || isAnalyzing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Tone
              {suggestionsByType.tone > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 text-xs">
                  {suggestionsByType.tone}
                </Badge>
              )}
            </Button>
            
            <Button
              onClick={onAnalyzeContent}
              disabled={isLoading || isAnalyzing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Content
              {suggestionsByType.content > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 text-xs">
                  {suggestionsByType.content}
                </Badge>
              )}
            </Button>
            
            <Button
              onClick={onAnalyzeEngagement}
              disabled={isLoading || isAnalyzing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Engagement
              {suggestionsByType.engagement > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 text-xs">
                  {suggestionsByType.engagement}
                </Badge>
              )}
            </Button>
          </div>
          
          {/* Main actions */}
          <div className="flex gap-2">
            <Button
              onClick={onAnalyzeFull}
              disabled={isLoading || isAnalyzing}
              className="flex-1"
            >
              {isLoading || isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze All
                </>
              )}
            </Button>
            
            {aiSuggestions.length > 0 && (
              <Button
                onClick={onClearSuggestions}
                variant="outline"
                disabled={isLoading || isAnalyzing}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="w-4 h-4" />
              <span className="text-sm">Failed to analyze: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions list */}
      {aiSuggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Suggestions ({aiSuggestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {aiSuggestions.map((suggestion) => (
                <SuggestionItem
                  key={suggestion.id}
                  suggestion={suggestion}
                  onAccept={onAcceptSuggestion}
                  onReject={onRejectSuggestion}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !isAnalyzing && aiSuggestions.length === 0 && !error && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready to enhance your writing?
            </h3>
            <p className="text-gray-600 mb-4">
              Click "Analyze All" to get AI-powered suggestions for style, tone, content, and engagement.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
