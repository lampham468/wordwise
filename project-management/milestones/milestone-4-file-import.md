# Milestone 4 · File Import & Content Extraction

> Transform the editor into a **multi-format content hub** by enabling users to upload and extract text from various file types. Implements text files, PDFs, audio, video transcription, and text-to-speech capabilities.

---

## Scope
1. Text file (.txt, .md, .rtf) extraction with client-side processing.
2. PDF text extraction using PDF.js in browser.
3. Audio transcription via OpenAI Whisper API.
4. Video transcription (audio track extraction + Whisper).
5. Text-to-speech synthesis for playback of written content.

---

## Deliverables
- `file-import` feature module with modular architecture.
- Drag & drop interface integrated into editor.
- Supabase Edge Functions for media transcription.
- Progress indicators and error handling for all file types.
- TTS playback controls in editor toolbar.

---

## Feature Breakdown & Action Steps

### 1 · Foundation & Text Files (Week 1)
1. Create `file-import` feature structure following existing patterns.
2. Implement `FileDropZone` component with drag & drop UI.
3. Build `text-extraction.service.ts` for plain text files.
4. Add `useFileUpload` hook with editor integration.
5. Create Zustand store for upload state management.

### 2 · PDF Text Extraction (Week 2)
1. Add PDF.js dependency and type definitions.
2. Extend `text-extraction.service.ts` with PDF processing.
3. Implement page-by-page text extraction with progress tracking.
4. Add PDF-specific error handling (corrupted files, password-protected).
5. Unit tests for PDF extraction edge cases.

### 3 · Audio Transcription Backend (Week 3)
1. Create Supabase Edge Function `transcribe-audio/index.ts`.
2. Integrate OpenAI Whisper API (reuse existing API key).
3. Handle file size limits and format validation.
4. Implement exponential backoff for API rate limits.
5. Add streaming progress updates via Server-Sent Events.

### 4 · Audio File Processing (Week 3)
1. Build `media-transcription.service.ts` for frontend API calls.
2. Add `useAudioTranscription` hook with progress tracking.
3. Support common audio formats (MP3, WAV, M4A, WEBM).
4. Implement file compression for large audio files.
5. Add transcription accuracy confidence indicators.

### 5 · Video File Support (Week 4)
1. Extend audio transcription logic for video files.
2. Support major video formats (MP4, AVI, MOV, MKV).
3. Add video preview thumbnail generation.
4. Implement audio track extraction validation.
5. Handle video-specific edge cases (no audio track).

### 6 · Text-to-Speech Integration (Week 5)
1. Create Supabase Edge Function `text-to-speech/index.ts`.
2. Implement OpenAI TTS API integration with voice selection.
3. Build `TTSControls` component for editor toolbar.
4. Add playback controls (play, pause, speed adjustment).
5. Cache generated audio for repeated playback.

### 7 · UI/UX Polish & Integration
1. Integrate `FileUploadButton` into `DocumentHeader`.
2. Add file type icons and visual feedback.
3. Implement processing progress indicators.
4. Create error toast notifications with retry logic.
5. Add keyboard shortcuts for file operations (Cmd+Shift+O).

### 8 · Performance & Optimization
1. Implement Web Worker for large file processing.
2. Add file size validation and compression.
3. Optimize PDF.js worker configuration.
4. Cache transcription results in IndexedDB.
5. Add memory usage monitoring for large files.

### 9 · Testing & Documentation
1. Unit tests for all extraction services.
2. Integration tests for file upload workflows.
3. E2E tests covering drag & drop scenarios.
4. Performance benchmarks for different file sizes.
5. User documentation for supported file formats.

---

## Technical Architecture

### File Import Feature Structure
```
app/src/features/file-import/
├── components/
│   ├── FileDropZone.tsx          # Drag & drop interface
│   ├── FileUploadButton.tsx      # Upload button component
│   ├── ProcessingIndicator.tsx   # Progress/loading states
│   └── index.ts
├── hooks/
│   ├── useFileUpload.ts          # Main upload orchestrator
│   ├── useTextExtraction.ts      # Text/PDF processing
│   ├── useAudioTranscription.ts  # Audio/video processing
│   └── useTTS.ts                 # Text-to-speech
├── services/
│   ├── text-extraction.service.ts      # Client-side text/PDF
│   ├── media-transcription.service.ts  # Server-side audio/video
│   ├── tts.service.ts                  # TTS functionality
│   └── index.ts
├── stores/
│   └── file-import.store.ts      # Upload state management
└── types/
    └── file-import.types.ts      # Type definitions
```

### Supabase Edge Functions
```
supabase/functions/
├── transcribe-audio/
│   └── index.ts                  # Whisper API integration
└── text-to-speech/
    └── index.ts                  # TTS API integration
```

---

## Success Metrics
- Support for 5+ file formats with seamless extraction.
- Audio transcription accuracy >95% for clear speech.
- File processing under 30 seconds for typical document sizes.
- Zero client-side crashes with malformed files.
- Cost per transcription minute under $0.01.

> Completion of **Milestone 4** transforms the writing assistant into a comprehensive content processing platform, enabling users to work with any text source. 
