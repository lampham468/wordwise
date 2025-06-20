/**
 * NewDocumentButton.tsx
 * 
 * Modern button component for creating new documents.
 * Features sleek styling with gradient background and hover effects.
 */

interface NewDocumentButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Button component for creating new documents
 */
export function NewDocumentButton({ 
  onClick, 
  disabled = false, 
  className = '' 
}: NewDocumentButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`sleek-button w-full h-12 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center transition-all duration-200 ${className}`}
      aria-label="Create new document"
      title="Create new document"
    >
      +
    </button>
  );
} 
