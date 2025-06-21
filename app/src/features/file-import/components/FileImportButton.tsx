/**
 * FileImportButton.tsx
 * 
 * Multi-option file import button with dropdown menu.
 * Provides options for different import types: text files, audio, video, and TTS.
 */

import { useState, useRef, useEffect } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import { useAudioTranscription } from '../hooks/useAudioTranscription';
import { useEditorStore } from '../../editor/stores/editor.store';

interface FileImportButtonProps {
  className?: string;
  onSuccess?: (content: string) => void;
}

/**
 * Multi-option file import button with dropdown menu
 */
export function FileImportButton({ className = '', onSuccess }: FileImportButtonProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const { setContent } = useEditorStore();
  
  // File upload hook
  const { uploadFile, isProcessing: isUploadProcessing, error: uploadError } = useFileUpload({
    onSuccess: (result) => {
      if (onSuccess) {
        onSuccess(result.content);
      } else {
        setContent(result.content);
      }
      setIsDropdownOpen(false);
    },
    autoInsertToEditor: false
  });

  // Audio transcription hook
  const { transcribeFile, isTranscribing, error: transcriptionError } = useAudioTranscription({
    onSuccess: (result) => {
      if (onSuccess) {
        onSuccess(result.content);
      } else {
        setContent(result.content);
      }
      setIsDropdownOpen(false);
    }
  });

  const isProcessing = isUploadProcessing || isTranscribing;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Handle file selection for text/PDF files
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
      // Reset input value so same file can be selected again
      event.target.value = '';
    }
  };

  // Handle audio/video file selection
  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      transcribeFile(file);
      // Reset input value so same file can be selected again
      event.target.value = '';
    }
  };



  // Handle voice recording
  const handleVoiceRecord = async () => {
    if (isListening) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
          
          // Transcribe the recording
          await transcribeFile(audioFile);
          
          // Clean up
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please check your browser permissions.');
      }
    }
  };

  const dropdownOptions = [
    {
      id: 'files',
      label: 'Text & PDF Files',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      onClick: () => fileInputRef.current?.click(),
      description: 'Upload .txt, .md, .rtf, or .pdf files'
    },
    {
      id: 'audio',
      label: 'Audio Files',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      onClick: () => audioInputRef.current?.click(),
      description: 'Transcribe .mp3, .wav, .m4a audio files'
    },
    {
      id: 'video',
      label: 'Video Files',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1M9 10v4a2 2 0 002 2h2a2 2 0 002-2v-4m-6 0V6a2 2 0 012-2h2a2 2 0 012 2v4" />
        </svg>
      ),
      onClick: () => {
        // Use same audio input but filter for video files
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            transcribeFile(file);
          }
        };
        input.click();
      },
      description: 'Extract audio from .mp4, .mov, .avi videos'
    },

    {
      id: 'voice',
      label: isListening ? 'Stop Recording' : 'Voice Recording',
      icon: isListening ? (
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h12v12H6z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      onClick: handleVoiceRecord,
      description: isListening ? 'Click to stop recording' : 'Record your voice and transcribe to text',
      disabled: false
    }
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={isProcessing}
        className="flex items-center justify-center w-10 h-10 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        title="Import content from files or voice"
      >
        {isProcessing ? (
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <svg 
            className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        )}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50">
          <div className="px-3 py-2 border-b border-neutral-100">
            <p className="text-sm font-medium text-neutral-900">Import Content</p>
            <p className="text-xs text-neutral-500">Choose how to add content to your document</p>
          </div>
          
          {dropdownOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                option.onClick();
                if (option.id !== 'voice') {
                  setIsDropdownOpen(false);
                }
              }}
              disabled={isProcessing || option.disabled}
              className="w-full px-3 py-3 text-left hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 p-1">
                  {option.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900">
                    {option.label}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.rtf,.pdf,text/plain,text/markdown,text/rtf,application/rtf,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        onChange={handleMediaSelect}
        className="hidden"
      />

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="absolute -top-16 right-0 bg-primary-50 border border-primary-200 rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full" />
            <p className="text-sm text-primary-800">
              {isUploadProcessing ? "Processing file..." :
               isTranscribing ? "Transcribing audio..." :
               "Processing..."}
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {(uploadError || transcriptionError) && (
        <div className="absolute -top-20 right-0 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg max-w-xs">
          <p className="text-sm text-red-800">
            {uploadError || transcriptionError}
          </p>
        </div>
      )}
    </div>
  );
} 
