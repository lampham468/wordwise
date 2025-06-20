/**
 * text-extraction.service.ts
 * 
 * Service for extracting text content from various file formats.
 * Handles text files client-side and will be extended for PDF processing.
 */

import type { 
  TextExtractionResult, 
  FileMetadata,
  SUPPORTED_TEXT_TYPES,
  SUPPORTED_PDF_TYPES 
} from '../types/file-import.types';

// PDF.js imports
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

/**
 * Extract text content from a file
 */
export async function extractTextFromFile(file: File): Promise<TextExtractionResult> {
  const startTime = Date.now();
  
  try {
    let content: string;
    let metadata: FileMetadata;

    // Handle text files
    if (isTextFile(file)) {
      content = await extractFromTextFile(file);
      metadata = createFileMetadata(file, Date.now() - startTime);
    }
    // Handle PDF files
    else if (isPDFFile(file)) {
      const { content: pdfContent, pageCount } = await extractFromPDFFile(file);
      content = pdfContent;
      metadata = createFileMetadata(file, Date.now() - startTime, { pageCount });
    }
    // Unsupported file type
    else {
      throw new Error(`Unsupported file type: ${file.type || 'unknown'}`);
    }

    return {
      content,
      metadata
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to extract text: ${message}`);
  }
}

/**
 * Extract text from plain text files
 */
async function extractFromTextFile(file: File): Promise<string> {
  try {
    const text = await file.text();
    
    // Basic validation
    if (!text || text.trim().length === 0) {
      throw new Error('File appears to be empty');
    }

    // Handle different text encodings and clean up
    return cleanTextContent(text);
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to read text file: ${message}`);
  }
}

/**
 * Clean and normalize text content
 */
function cleanTextContent(text: string): string {
  return text
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive whitespace but preserve intentional formatting
    .replace(/\n{3,}/g, '\n\n')
    // Trim overall content
    .trim();
}

/**
 * Create file metadata object
 */
function createFileMetadata(
  file: File, 
  processingTime: number,
  additionalData: Partial<FileMetadata> = {}
): FileMetadata {
  return {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'unknown',
    extractedAt: new Date(),
    processingTime,
    ...additionalData
  };
}

/**
 * Check if file is a supported text file
 */
function isTextFile(file: File): boolean {
  const textTypes = [
    'text/plain',
    'text/markdown',
    'text/rtf',
    'application/rtf'
  ];
  
  // Check MIME type
  if (textTypes.includes(file.type)) {
    return true;
  }
  
  // Check file extension as fallback
  const name = file.name.toLowerCase();
  return name.endsWith('.txt') || 
         name.endsWith('.md') || 
         name.endsWith('.rtf') ||
         name.endsWith('.text');
}

/**
 * Check if file is a PDF
 */
function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Validate file size limits
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): void {
  const maxBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxBytes) {
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size of ${maxSizeMB}MB`);
  }
}

/**
 * Get supported file types for file input accept attribute
 */
export function getSupportedFileTypes(): string {
  return [
    '.txt', '.text', '.md', '.rtf', // Text files
    '.pdf' // PDFs (coming in Phase 2)
  ].join(',');
}

/**
 * Extract text from PDF files using PDF.js
 */
async function extractFromPDFFile(file: File): Promise<{ content: string; pageCount: number }> {
  try {
    // Configure PDF.js worker
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    }

    // Load PDF document
    const arrayBuffer = await file.arrayBuffer();
    const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: 'https://unpkg.com/pdfjs-dist@' + pdfjsLib.version + '/cmaps/',
      cMapPacked: true,
    }).promise;

    const pageCount = pdf.numPages;
    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      try {
        const page: PDFPageProxy = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Extract text items and join them
        const pageText = textContent.items
          .map((item: any) => {
            // Handle different text item types
            if ('str' in item) {
              return item.str;
            }
            return '';
          })
          .join(' ');

        // Add page separator for multi-page documents
        if (pageText.trim()) {
          fullText += pageText.trim();
          if (pageNum < pageCount) {
            fullText += '\n\n--- Page ' + (pageNum + 1) + ' ---\n\n';
          }
        }
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }

    // Clean up the extracted text
    const cleanedText = cleanTextContent(fullText);
    
    if (!cleanedText || cleanedText.trim().length === 0) {
      throw new Error('PDF appears to contain no extractable text. It may be image-based or corrupted.');
    }

    return {
      content: cleanedText,
      pageCount
    };

  } catch (error) {
    if (error instanceof Error) {
      // Handle specific PDF.js errors
      if (error.message.includes('Invalid PDF structure')) {
        throw new Error('PDF file is corrupted or invalid');
      }
      if (error.message.includes('password')) {
        throw new Error('PDF is password-protected. Please provide an unprotected version.');
      }
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
    throw new Error('Failed to extract text from PDF: Unknown error occurred');
  }
}

/**
 * Check if file type is supported
 */
export function isFileTypeSupported(file: File): boolean {
  return isTextFile(file) || isPDFFile(file);
} 
