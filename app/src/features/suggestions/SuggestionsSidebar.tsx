/**
 * SuggestionsSidebar.tsx - Main sidebar for all writing suggestions
 * 
 * Displays both traditional suggestions (grammar/spelling) and AI-powered suggestions
 */

import { useState, useMemo } from 'react'
import { useWritingAnalysis } from './hooks/useWritingAnalysis'
import { useEditorStore } from '../editor/stores/editor.store'
import { useSuggestionsStore } from './stores/suggestions.store'
import { applySuggestion } from './services/writing.service'
import { htmlToPlainText } from '@/utils/text-conversion'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { CheckCircle, RefreshCw, BookOpen, Sparkles } from 'lucide-react'
import type { Suggestion } from '@/types/suggestions'

interface SuggestionsSidebarProps {
  text: string
  documentId?: string
  documentNumber?: number
  userId?: string
  className?: string
}

/**
 * Traditional suggestion item component (grammar/spelling)
 */
function TraditionalSuggestionItem({ 
  suggestion,
  onApply 
}: {
  suggestion: Suggestion
  onApply: (suggestion: Suggestion) => void
}) {
  return (
    <Card className="mb-3 border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={
                  suggestion.type === 'grammar' 
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }
              >
                {suggestion.type}
              </Badge>
              <span className="text-xs text-gray-500 capitalize">
                {suggestion.category?.replace('-', ' ') || 'general'}
              </span>
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
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onApply(suggestion)}
            className="h-8 px-2 text-green-600 hover:bg-green-50"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Main suggestions sidebar component
 */
export function SuggestionsSidebar({
  text,
  className = ''
}: SuggestionsSidebarProps) {
  const [activeTab, setActiveTab] = useState('traditional')

  // Editor store for content updates
  const { content, setContent } = useEditorStore()

  // Suggestions store for dismissing applied suggestions
  const { dismissSuggestion } = useSuggestionsStore()

  // Convert HTML content to plain text for analysis
  const plainTextContent = useMemo(() => {
    const { text: plainText } = htmlToPlainText(text);
    console.log('📄 HTML to plain text conversion:', { 
      htmlLength: text.length, 
      plainLength: plainText.length,
      html: text.substring(0, 100),
      plain: plainText.substring(0, 100)
    });
    return plainText;
  }, [text]);

  // Traditional grammar/spelling analysis using plain text
  const {
    suggestions: traditionalSuggestions,
    isAnalyzing: isTraditionalLoading,
    error: traditionalError,
    triggerAnalysis: analyzeTraditional
  } = useWritingAnalysis(plainTextContent, true)

  // AI-powered suggestions - simplified for now
  const totalAISuggestions = 0;

  // Filter traditional suggestions (grammar/spelling only)
  const grammarSpellingSuggestions = useMemo(() => 
    traditionalSuggestions.filter(s => ['grammar', 'spelling'].includes(s.type)),
    [traditionalSuggestions]
  )

  // Combined stats
  const totalTraditionalSuggestions = grammarSpellingSuggestions.length
  const totalSuggestions = totalTraditionalSuggestions + totalAISuggestions

  const handleApplyTraditionalSuggestion = (suggestion: Suggestion) => {
    try {
      // Apply the suggestion to the current editor content
      const newContent = applySuggestion(suggestion, content);
      
      // Update the editor with the new content
      setContent(newContent);
      
      // Remove the applied suggestion from the list
      dismissSuggestion(suggestion.id);
      
      console.log('✅ Applied suggestion:', suggestion.message);
    } catch (error) {
      console.error('❌ Failed to apply suggestion:', error);
    }
  }

  const handleRefreshTraditional = () => {
    analyzeTraditional()
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Writing Assistant
        </h2>
        {totalSuggestions > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {totalSuggestions} suggestion{totalSuggestions !== 1 ? 's' : ''}
            </Badge>
            {totalTraditionalSuggestions > 0 && (
              <Badge variant="outline" className="text-xs">
                {totalTraditionalSuggestions} traditional
              </Badge>
            )}
            {totalAISuggestions > 0 && (
              <Badge variant="outline" className="text-xs">
                {totalAISuggestions} AI
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
            <TabsTrigger value="traditional" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Grammar & Spelling
              {totalTraditionalSuggestions > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 text-xs">
                  {totalTraditionalSuggestions}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Assistant
              {totalAISuggestions > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 text-xs">
                  {totalAISuggestions}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="traditional" className="p-4 space-y-4 h-full">
              {/* Traditional suggestions header */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Grammar & Spelling
                    </CardTitle>
                    <Button
                      onClick={handleRefreshTraditional}
                      disabled={isTraditionalLoading}
                      size="sm"
                      variant="outline"
                    >
                      <RefreshCw className={`w-4 h-4 ${isTraditionalLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {traditionalError && (
                    <div className="text-sm text-red-600 mb-2">
                      Error: {traditionalError}
                    </div>
                  )}
                  {isTraditionalLoading && (
                    <div className="text-sm text-gray-600">
                      Analyzing grammar and spelling...
                    </div>
                  )}
                  {!isTraditionalLoading && totalTraditionalSuggestions === 0 && (
                    <div className="text-sm text-gray-600">
                      No grammar or spelling issues detected.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Traditional suggestions list */}
              {grammarSpellingSuggestions.map((suggestion) => (
                <TraditionalSuggestionItem
                  key={suggestion.id}
                  suggestion={suggestion}
                  onApply={handleApplyTraditionalSuggestion}
                />
              ))}
            </TabsContent>

            <TabsContent value="ai" className="p-4 h-full">
              <div className="text-center text-neutral-500">
                <p>AI suggestions coming soon!</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
} 
