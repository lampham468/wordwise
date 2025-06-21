/**
 * ProcessingIndicator.tsx
 * 
 * Component for displaying file processing progress, status, and results.
 * Shows active uploads, progress bars, and completion status.
 */

import { useFileImportStore } from '../stores/file-import.store';
import type { FileUploadProgress, ProcessingStatus } from '../types/file-import.types';

interface ProcessingIndicatorProps {
  className?: string;
  showCompleted?: boolean;
  maxVisible?: number;
}

/**
 * Processing indicator that shows active file uploads and their progress
 */
export function ProcessingIndicator({
  className = '',
  showCompleted = false,
  maxVisible = 5
}: ProcessingIndicatorProps) {
  const { uploadProgress, removeFileUpload } = useFileImportStore();
  
  const uploads = Array.from(uploadProgress.values());
  const activeUploads = uploads.filter(upload => 
    upload.status === 'uploading' || 
    upload.status === 'processing' ||
    (showCompleted && upload.status === 'completed') ||
    upload.status === 'error'
  ).slice(0, maxVisible);

  if (activeUploads.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {activeUploads.map((upload, index) => (
        <UploadItem
          key={`${upload.file.name}-${upload.file.size}-${index}`}
          upload={upload}
          onRemove={() => {
            const fileId = `${upload.file.name}-${upload.file.size}-${Date.now()}`;
            removeFileUpload(fileId);
          }}
        />
      ))}
    </div>
  );
}

interface UploadItemProps {
  upload: FileUploadProgress;
  onRemove: () => void;
}

/**
 * Individual upload item with progress and status
 */
function UploadItem({ upload, onRemove }: UploadItemProps) {
  const { file, status, progress, error } = upload;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <FileIcon fileType={file.type} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <StatusIndicator status={status} />
          {(status === 'completed' || status === 'error') && (
            <button
              onClick={onRemove}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Remove"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {(status === 'uploading' || status === 'processing') && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{getStatusText(status)}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {status === 'error' && error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success message */}
      {status === 'completed' && (
        <div className="mt-2 text-sm text-green-700">
          ✓ Text extracted successfully
        </div>
      )}
    </div>
  );
}

/**
 * File type icon component
 */
function FileIcon({ fileType }: { fileType: string }) {
  const getIconColor = () => {
    if (fileType.startsWith('text/')) return 'text-blue-600';
    if (fileType === 'application/pdf') return 'text-red-600';
    if (fileType.startsWith('audio/')) return 'text-green-600';
    if (fileType.startsWith('video/')) return 'text-purple-600';
    return 'text-gray-600';
  };

  return (
    <div className={`w-8 h-8 flex items-center justify-center ${getIconColor()}`}>
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
        <path d="M14 2v6h6"/>
      </svg>
    </div>
  );
}

/**
 * Status indicator component
 */
function StatusIndicator({ status }: { status: ProcessingStatus }) {
  const configs = {
    idle: { color: 'text-gray-400', icon: '⏸️' },
    uploading: { color: 'text-blue-600', icon: '⬆️' },
    processing: { color: 'text-yellow-600', icon: '⚡' },
    completed: { color: 'text-green-600', icon: '✅' },
    error: { color: 'text-red-600', icon: '❌' }
  };

  const config = configs[status];

  return (
    <div className={`text-sm ${config.color}`} title={getStatusText(status)}>
      {config.icon}
    </div>
  );
}

/**
 * Get human-readable status text
 */
function getStatusText(status: ProcessingStatus): string {
  const statusTexts = {
    idle: 'Ready',
    uploading: 'Uploading',
    processing: 'Processing',
    completed: 'Completed',
    error: 'Error'
  };

  return statusTexts[status];
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
} 
