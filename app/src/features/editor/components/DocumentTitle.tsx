/**
 * DocumentTitle.tsx
 * 
 * Component for displaying document title as an always-editable mini textbox.
 * Automatically saves changes on blur or Enter key.
 */

import { useEditorStore } from '../stores/editor.store';
import { useState, useEffect } from 'react';

/**
 * Document title as an editable mini textbox
 */
export function DocumentTitle() {
  const { title, setTitle } = useEditorStore();
  const [localTitle, setLocalTitle] = useState(title);

  // Sync local state with store when title changes from external sources
  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
  };

  const handleSave = () => {
    if (localTitle.trim() !== title) {
      setTitle(localTitle.trim() || 'Untitled');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setLocalTitle(title); // Reset to original
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  return (
    <div className="flex items-center">
      <input
        type="text"
        value={localTitle}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Untitled"
        className="text-lg font-semibold text-neutral-900 bg-neutral-100 border border-neutral-200 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:bg-neutral-50 transition-colors min-w-0 flex-1"
      />
    </div>
  );
} 
