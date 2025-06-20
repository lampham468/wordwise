/**
 * TTSControls.tsx
 * 
 * Text-to-speech controls component for the editor toolbar.
 * Provides play, pause, stop, and voice selection controls.
 */

import React, { useState } from 'react';
import { useTTS } from '../hooks/useTTS';
import type { TTSOptions } from '../types/file-import.types';

interface TTSControlsProps {
  text: string;
  className?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * TTS controls for editor integration
 */
export function TTSControls({
  text,
  className = '',
  disabled = false,
  onSuccess,
  onError
}: TTSControlsProps) {
  const [showVoiceOptions, setShowVoiceOptions] = useState(false);
  const [ttsOptions, setTtsOptions] = useState<TTSOptions>({
    voice: 'alloy',
    speed: 1.0,
    format: 'mp3'
  });

  const {
    synthesize,
    play,
    pause,
    stop,
    isPlaying,
    isSynthesizing,
    progress,
    error,
    estimatedCost,
    clearError
  } = useTTS({
    ...ttsOptions,
    onSuccess,
    onError,
    autoPlay: true
  });

  /**
   * Handle TTS synthesis
   */
  const handleSynthesize = async () => {
    if (!text || text.trim().length === 0) {
      return;
    }

    try {
      clearError();
      await synthesize(text);
    } catch (error) {
      console.error('TTS failed:', error);
    }
  };

  /**
   * Handle voice selection
   */
  const handleVoiceChange = (voice: TTSOptions['voice']) => {
    setTtsOptions(prev => ({ ...prev, voice }));
    setShowVoiceOptions(false);
  };

  /**
   * Handle speed change
   */
  const handleSpeedChange = (speed: number) => {
    setTtsOptions(prev => ({ ...prev, speed }));
  };

  const isDisabled = disabled || !text || text.trim().length === 0;
  const cost = text ? estimatedCost(text) : 0;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Main TTS Button */}
      <div className="relative">
        <button
          onClick={handleSynthesize}
          disabled={isDisabled || isSynthesizing}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          title={`Convert to speech (Est. $${cost.toFixed(4)})`}
        >
          {isSynthesizing ? (
            <>
              <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Converting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M8.586 17.414L12 14l-3.414-3.414-1.172 1.172 4.243 4.243z" />
              </svg>
              Speak
            </>
          )}
        </button>

        {/* Progress indicator */}
        {isSynthesizing && progress > 0 && (
          <div className="absolute bottom-0 left-0 h-1 bg-green-400 rounded-b-md transition-all duration-300" 
               style={{ width: `${progress}%` }} />
        )}
      </div>

      {/* Playback Controls */}
      {(isPlaying || isSynthesizing) && (
        <div className="flex items-center space-x-1">
          <button
            onClick={isPlaying ? pause : () => play()}
            className="p-1.5 text-gray-600 hover:text-gray-800 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a2 2 0 002 2h2a2 2 0 002-2v-4m-6 0a2 2 0 012-2h2a2 2 0 012 2m-6 0V6a2 2 0 012-2h2a2 2 0 012 2v4" />
              </svg>
            )}
          </button>

          <button
            onClick={stop}
            className="p-1.5 text-gray-600 hover:text-gray-800 transition-colors"
            title="Stop"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
            </svg>
          </button>
        </div>
      )}

      {/* Voice Options */}
      <div className="relative">
        <button
          onClick={() => setShowVoiceOptions(!showVoiceOptions)}
          className="p-1.5 text-gray-600 hover:text-gray-800 transition-colors"
          title="Voice settings"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Voice Options Dropdown */}
        {showVoiceOptions && (
          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-48">
            <div className="p-3 space-y-3">
              {/* Voice Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Voice</label>
                <div className="grid grid-cols-2 gap-1">
                  {['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].map((voice) => (
                    <button
                      key={voice}
                      onClick={() => handleVoiceChange(voice as TTSOptions['voice'])}
                      className={`px-2 py-1 text-xs rounded capitalize transition-colors ${
                        ttsOptions.voice === voice
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {voice}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed Control */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Speed: {ttsOptions.speed}x
                </label>
                <input
                  type="range"
                  min="0.25"
                  max="4"
                  step="0.25"
                  value={ttsOptions.speed}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Cost Display */}
              <div className="text-xs text-gray-500 border-t border-gray-100 pt-2">
                Est. cost: ${cost.toFixed(4)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-600 text-xs">
          {error}
        </div>
      )}
    </div>
  );
} 
