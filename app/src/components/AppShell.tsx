/**
 * AppShell.tsx – Main application layout shell
 * Provides the base layout structure with sidebar and main content area
 */

import { type ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
  sidebar?: ReactNode
}

/**
 * AppShell component provides the main layout structure for the application
 * @param children - Main content to render
 * @param sidebar - Optional sidebar content
 */
export function AppShell({ children, sidebar }: AppShellProps) {
  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      {sidebar && (
        <aside className="sidebar-width bg-white border-r border-neutral-200 flex-shrink-0">
          {sidebar}
        </aside>
      )}
      
      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}

export default AppShell 
