/**
 * Dashboard.tsx
 * 
 * Main dashboard component that orchestrates the entire application.
 * Shows user information and provides the main app layout.
 */

import { useAuth } from '@/features/auth/hooks/useAuth';
import { AppLayout } from '@/shared/components/layout/AppLayout';

/**
 * Dashboard component - main application interface
 */
export function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4 toolbar-height">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-neutral-900 font-sans">WordWise</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-neutral-600 leading-relaxed">
              Welcome, {user?.email || 'User'}
            </span>
            <button
              onClick={signOut}
              className="text-sm text-neutral-500 hover:text-neutral-700 font-medium transition-colors duration-75 focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded px-2 py-1"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Application */}
      <main className="flex-1 overflow-hidden">
        <AppLayout />
      </main>
    </div>
  );
} 
