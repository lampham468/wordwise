/**
 * setup.ts – Test setup configuration
 * Configures the testing environment with necessary imports and globals
 */

import '@testing-library/jest-dom'

// Mock IntersectionObserver for testing
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  root = null
  rootMargin = ''
  thresholds = []
  takeRecords() {
    return []
  }
}

// Mock ResizeObserver for testing
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock matchMedia for testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
}) 
