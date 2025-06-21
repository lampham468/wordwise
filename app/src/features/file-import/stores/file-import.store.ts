/**
 * file-import.store.ts
 * 
 * Zustand store for managing file import state, processing progress,
 * and uploaded file history.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  FileImportState, 
  ProcessedFile, 
  FileUploadProgress,
  ProcessingStatus,
  TextExtractionResult
} from '../types/file-import.types';

interface FileImportStore extends FileImportState {
  // Upload progress tracking
  uploadProgress: Map<string, FileUploadProgress>;
  
  // Actions
  setProcessing: (isProcessing: boolean) => void;
  setCurrentFile: (file: File | null) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  addProcessedFile: (file: ProcessedFile) => void;
  clearProcessedFiles: () => void;
  
  // Upload progress actions
  startFileUpload: (file: File) => void;
  updateFileProgress: (fileId: string, progress: number) => void;
  setFileStatus: (fileId: string, status: ProcessingStatus, error?: string) => void;
  completeFileUpload: (fileId: string, result: TextExtractionResult) => void;
  removeFileUpload: (fileId: string) => void;
  clearAllUploads: () => void;
  
  // Getters
  getFileProgress: (fileId: string) => FileUploadProgress | undefined;
  getActiveUploads: () => FileUploadProgress[];
  hasActiveUploads: () => boolean;
}

/**
 * Generate a unique ID for file uploads
 */
function generateFileId(file: File): string {
  return `${file.name}-${file.size}-${Date.now()}`;
}

export const useFileImportStore = create<FileImportStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isProcessing: false,
    currentFile: null,
    progress: 0,
    error: null,
    processedFiles: [],
    uploadProgress: new Map(),

    // Basic actions
    setProcessing: (isProcessing) => set({ isProcessing }),
    
    setCurrentFile: (currentFile) => set({ currentFile }),
    
    setProgress: (progress) => set({ progress }),
    
    setError: (error) => set({ error }),
    
    addProcessedFile: (file) => 
      set((state) => ({
        processedFiles: [file, ...state.processedFiles].slice(0, 50) // Keep last 50 files
      })),
    
    clearProcessedFiles: () => set({ processedFiles: [] }),

    // Upload progress actions
    startFileUpload: (file) => {
      const fileId = generateFileId(file);
      const uploadProgress = new Map(get().uploadProgress);
      
      uploadProgress.set(fileId, {
        file,
        status: 'uploading',
        progress: 0
      });
      
      set({ uploadProgress });
    },

    updateFileProgress: (fileId, progress) => {
      const uploadProgress = new Map(get().uploadProgress);
      const fileUpload = uploadProgress.get(fileId);
      
      if (fileUpload) {
        uploadProgress.set(fileId, {
          ...fileUpload,
          progress
        });
        set({ uploadProgress });
      }
    },

    setFileStatus: (fileId, status, error) => {
      const uploadProgress = new Map(get().uploadProgress);
      const fileUpload = uploadProgress.get(fileId);
      
      if (fileUpload) {
        uploadProgress.set(fileId, {
          ...fileUpload,
          status,
          ...(error !== undefined && { error })
        });
        set({ uploadProgress });
      }
    },

    completeFileUpload: (fileId, result) => {
      const uploadProgress = new Map(get().uploadProgress);
      const fileUpload = uploadProgress.get(fileId);
      
      if (fileUpload) {
        uploadProgress.set(fileId, {
          ...fileUpload,
          status: 'completed',
          progress: 100,
          result
        });
        set({ uploadProgress });
      }
    },

    removeFileUpload: (fileId) => {
      const uploadProgress = new Map(get().uploadProgress);
      uploadProgress.delete(fileId);
      set({ uploadProgress });
    },

    clearAllUploads: () => set({ uploadProgress: new Map() }),

    // Getters
    getFileProgress: (fileId) => get().uploadProgress.get(fileId),
    
    getActiveUploads: () => Array.from(get().uploadProgress.values()),
    
    hasActiveUploads: () => {
      const uploads = Array.from(get().uploadProgress.values());
      return uploads.some(upload => 
        upload.status === 'uploading' || upload.status === 'processing'
      );
    }
  }))
); 
