/**
 * useDebounce.ts – Enhanced debounce hook with cancellation support
 * Useful for auto-save and search functionality with race condition prevention
 */

import { useEffect, useRef, useMemo } from 'react'

/**
 * Enhanced hook for debouncing function calls with cancellation support
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Object with debounced function and cancel method
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T & { cancel: () => void } {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Memoize the debounced function and cancel method to prevent unnecessary re-renders
  const debouncedFn = useMemo(() => {
    const debounced = ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    }) as T

    // Add cancel method to the debounced function
    const cancel = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = undefined
      }
    }

    // Attach cancel method to the debounced function
    Object.assign(debounced, { cancel })

    return debounced as T & { cancel: () => void }
  }, [delay])

  return debouncedFn
}

export default useDebounce 
