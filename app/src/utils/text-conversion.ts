/**
 * text-conversion.ts - Utilities for converting between HTML and plain text
 * 
 * Handles position mapping between HTML content and plain text for spell checking
 */

/**
 * Convert HTML to plain text while preserving position mapping
 */
export function htmlToPlainText(html: string): { 
  text: string; 
  positionMap: Array<{ htmlPos: number; textPos: number }> 
} {
  if (!html || html.trim() === '') {
    return { text: '', positionMap: [] };
  }

  // Simple HTML to text conversion that tracks positions
  const positionMap: Array<{ htmlPos: number; textPos: number }> = [];
  let text = '';
  let htmlPos = 0;
  let textPos = 0;
  let inTag = false;

  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    htmlPos = i;

    if (char === '<') {
      inTag = true;
    } else if (char === '>') {
      inTag = false;
      continue;
    }

    if (!inTag) {
      // Handle HTML entities
      if (char === '&') {
        const entityEnd = html.indexOf(';', i);
        if (entityEnd !== -1) {
          const entity = html.substring(i, entityEnd + 1);
          // Common HTML entities
          const entityMap: Record<string, string> = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&apos;': "'",
            '&nbsp;': ' '
          };
          
          const replacement = entityMap[entity] || entity;
          text += replacement;
          positionMap.push({ htmlPos: i, textPos: textPos });
          textPos += replacement.length;
          i = entityEnd; // Skip to end of entity
          continue;
        }
      }
      
      text += char;
      positionMap.push({ htmlPos: htmlPos, textPos: textPos });
      textPos++;
    }
  }

  return { text, positionMap };
}

/**
 * Map a plain text position to HTML position
 */
export function mapTextPositionToHtml(
  textPos: number, 
  positionMap: Array<{ htmlPos: number; textPos: number }>
): number {
  // Find the closest position mapping
  for (let i = 0; i < positionMap.length; i++) {
    const mapping = positionMap[i];
    if (mapping && mapping.textPos >= textPos) {
      return mapping.htmlPos;
    }
  }
  
  // Fallback to the last position
  const lastMapping = positionMap[positionMap.length - 1];
  return lastMapping ? lastMapping.htmlPos : 0;
}

/**
 * Map HTML positions back to text positions for spell checking
 */
export function mapHtmlPositionToText(
  htmlPos: number,
  positionMap: Array<{ htmlPos: number; textPos: number }>
): number {
  // Find the closest position mapping
  for (let i = positionMap.length - 1; i >= 0; i--) {
    const mapping = positionMap[i];
    if (mapping && mapping.htmlPos <= htmlPos) {
      return mapping.textPos;
    }
  }
  
  return 0;
} 
