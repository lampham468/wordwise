/**
 * FileDropZone.tsx
 * 
 * Drag and drop zone component that wraps content and handles file drops.
 * Provides visual feedback during drag operations and supports multiple file types.
 */

import React, { useCallback, useState, useRef } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import type { TextExtractionResult } from '../types/file-import.types';

interface FileDropZoneProps {
  children: React.ReactNode;
  onFileUpload?: (result: TextExtractionResult) => void;
  onError?: (error: string) => void;
  maxFileSizeMB?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * File drop zone that wraps content and handles drag & drop operations
 */
export function FileDropZone({
  children,
  onFileUpload,
  onError,
  maxFileSizeMB = 10,
  className = '',
  disabled = false
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const { uploadFiles, isProcessing } = useFileUpload({
    ...(onFileUpload && { onSuccess: onFileUpload }),
    ...(onError && { onError }),
    maxFileSizeMB,
    autoInsertToEditor: !onFileUpload // Only auto-insert if no custom handler
  });

  /**
   * Handle drag enter events
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, [disabled]);

  /**
   * Handle drag leave events
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;

    // Only set to false if leaving the main drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, [disabled]);

  /**
   * Handle drag over events
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;

    // Provide visual feedback
    e.dataTransfer.dropEffect = 'copy';
  }, [disabled]);

  /**
   * Handle file drop events
   */
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;

    // Reset drag state
    setIsDragOver(false);

    // Get dropped files
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length === 0) return;

    // Upload files
    try {
      await uploadFiles(files);
    } catch (error) {
      console.error('File upload failed:', error);
    }
  }, [disabled, uploadFiles]);

  /**
   * Prevent default drag behaviors on the document
   */
  React.useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('dragenter', preventDefault);
    document.addEventListener('dragover', preventDefault);
    document.addEventListener('drop', preventDefault);

    return () => {
      document.removeEventListener('dragenter', preventDefault);
      document.removeEventListener('dragover', preventDefault);
      document.removeEventListener('drop', preventDefault);
    };
  }, []);

  const baseClasses = "relative transition-all duration-200";
  const dragOverClasses = isDragOver && !disabled
    ? "bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg"
    : "";
  const disabledClasses = disabled ? "opacity-50 pointer-events-none" : "";

  return (
    <div
      ref={dropZoneRef}
      className={`${baseClasses} ${dragOverClasses} ${disabledClasses} ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
      
      {/* Drag overlay */}
      {isDragOver && !disabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 rounded-lg pointer-events-none z-50">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-blue-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-blue-900 mb-2">
              Drop files to extract text
            </p>
            <p className="text-sm text-blue-700">
              Supports text files, PDFs, audio, and video
            </p>
          </div>
        </div>
      )}

      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg z-40">
          <div className="text-center p-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm font-medium text-gray-900">
              Processing file...
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 
