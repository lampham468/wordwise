/**
 * FileUploadButton.tsx
 * 
 * File upload button component for manual file selection.
 * Works alongside the drag & drop zone and provides traditional file picker interface.
 */

import React, { useRef, useCallback } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import { getSupportedFileTypes } from '../services/text-extraction.service';
import type { TextExtractionResult } from '../types/file-import.types';

interface FileUploadButtonProps {
  onFileUpload?: (result: TextExtractionResult) => void;
  onError?: (error: string) => void;
  maxFileSizeMB?: number;
  multiple?: boolean;
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

/**
 * File upload button with customizable styling and behavior
 */
export function FileUploadButton({
  onFileUpload,
  onError,
  maxFileSizeMB = 10,
  multiple = false,
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadFiles, isProcessing } = useFileUpload({
    ...(onFileUpload && { onSuccess: onFileUpload }),
    ...(onError && { onError }),
    maxFileSizeMB,
    autoInsertToEditor: !onFileUpload
  });

  /**
   * Handle file input change
   */
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    try {
      await uploadFiles(files);
    } catch (error) {
      console.error('File upload failed:', error);
    }

    // Reset input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadFiles]);

  /**
   * Open file picker
   */
  const handleClick = useCallback(() => {
    if (disabled || isProcessing) return;
    fileInputRef.current?.click();
  }, [disabled, isProcessing]);

  // Build CSS classes
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500",
    outline: "border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded",
    md: "px-4 py-2 text-sm rounded-md",
    lg: "px-6 py-3 text-base rounded-lg"
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={buttonClasses}
        aria-label="Upload file"
      >
        {isProcessing ? (
          <>
            <svg 
              className="w-4 h-4 mr-2 animate-spin" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </>
        ) : (
          <>
            {children || (
              <>
                <svg 
                  className="w-4 h-4 mr-2" 
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
                Upload File
              </>
            )}
          </>
        )}
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept={getSupportedFileTypes()}
        multiple={multiple}
        className="hidden"
        aria-hidden="true"
      />
    </>
  );
}

/**
 * Preset button variants for common use cases
 */
export const FileUploadButtons = {
  Primary: (props: Omit<FileUploadButtonProps, 'variant'>) => 
    <FileUploadButton {...props} variant="primary" />,
    
  Secondary: (props: Omit<FileUploadButtonProps, 'variant'>) => 
    <FileUploadButton {...props} variant="secondary" />,
    
  Outline: (props: Omit<FileUploadButtonProps, 'variant'>) => 
    <FileUploadButton {...props} variant="outline" />,
    
  Small: (props: Omit<FileUploadButtonProps, 'size'>) => 
    <FileUploadButton {...props} size="sm" />,
    
  Large: (props: Omit<FileUploadButtonProps, 'size'>) => 
    <FileUploadButton {...props} size="lg" />
}; 
