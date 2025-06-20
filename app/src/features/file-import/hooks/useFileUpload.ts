/**
 * useFileUpload.ts
 * 
 * Main hook for orchestrating file upload and text extraction.
 * Integrates with editor store and provides unified upload interface.
 */

import { useCallback } from 'react';
import { useFileImportStore } from '../stores/file-import.store';
import { extractTextFromFile, validateFileSize, isFileTypeSupported } from '../services/text-extraction.service';
import type { TextExtractionResult } from '../types/file-import.types';

interface UseFileUploadOptions {
  onSuccess?: (result: TextExtractionResult) => void;
  onError?: (error: string) => void;
  maxFileSizeMB?: number;
  autoInsertToEditor?: boolean;
}

interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<void>;
  uploadFiles: (files: File[]) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for handling file uploads with text extraction
 */
export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const {
    onSuccess,
    onError,
    maxFileSizeMB = 10,
    autoInsertToEditor = true
  } = options;

  const {
    isProcessing,
    error,
    setProcessing,
    setError,
    setCurrentFile,
    addProcessedFile,
    startFileUpload,
    updateFileProgress,
    setFileStatus,
    completeFileUpload
  } = useFileImportStore();

  /**
   * Upload and process a single file
   */
  const uploadFile = useCallback(async (file: File): Promise<void> => {
    try {
      // Reset error state
      setError(null);
      setCurrentFile(file);
      setProcessing(true);

      // Generate file ID for progress tracking
      const fileId = `${file.name}-${file.size}-${Date.now()}`;
      startFileUpload(file);

      // Validate file
      validateFile(file, maxFileSizeMB);
      updateFileProgress(fileId, 25);

      // Extract text content
      setFileStatus(fileId, 'processing');
      const result = await extractTextFromFile(file);
      updateFileProgress(fileId, 75);

      // Create processed file record
      const processedFile = {
        id: fileId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        processedAt: new Date(),
        extractionResult: result
      };

      // Update stores
      addProcessedFile(processedFile);
      completeFileUpload(fileId, result);
      updateFileProgress(fileId, 100);

      // Handle success
      if (onSuccess) {
        onSuccess(result);
      }

      // Auto-insert into editor if enabled and no custom success handler
      if (autoInsertToEditor && !onSuccess) {
        await insertIntoEditor(result.content);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }

      // Update file status to error
      const fileId = `${file.name}-${file.size}-${Date.now()}`;
      setFileStatus(fileId, 'error', errorMessage);
      
      throw error;
    } finally {
      setProcessing(false);
      setCurrentFile(null);
    }
  }, [maxFileSizeMB, onSuccess, onError, autoInsertToEditor]);

  /**
   * Upload and process multiple files
   */
  const uploadFiles = useCallback(async (files: File[]): Promise<void> => {
    const uploadPromises = files.map(file => uploadFile(file));
    
    try {
      await Promise.allSettled(uploadPromises);
    } catch (error) {
      // Individual file errors are handled in uploadFile
      console.error('Batch upload completed with some errors:', error);
    }
  }, [uploadFile]);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    uploadFile,
    uploadFiles,
    isProcessing,
    error,
    clearError
  };
}

/**
 * Validate file before processing
 */
function validateFile(file: File, maxSizeMB: number): void {
  // Check file type support
  if (!isFileTypeSupported(file)) {
    throw new Error(`File type not supported: ${file.type || 'unknown'}`);
  }

  // Check file size
  validateFileSize(file, maxSizeMB);

  // Check file name
  if (!file.name || file.name.trim().length === 0) {
    throw new Error('File must have a valid name');
  }
}

/**
 * Insert extracted text into the editor
 * This will be integrated with the editor store in the integration phase
 */
async function insertIntoEditor(content: string): Promise<void> {
  // TODO: Integrate with editor store
  // For now, we'll just log the content
  console.log('Content extracted, ready for editor integration:', {
    contentLength: content.length,
    preview: content.substring(0, 100) + (content.length > 100 ? '...' : '')
  });
  
  // This will be replaced with actual editor integration:
  // const { setContent } = useEditorStore();
  // setContent(content);
} 
