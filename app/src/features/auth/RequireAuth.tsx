/**
 * RequireAuth.tsx – Route protection component
 * Guards protected routes and redirects unauthenticated users to login
 */

import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface RequireAuthProps {
  children: ReactNode
}

/**
 * Route guard component
 * Protects routes that require authentication
 * @param children - Components to render if authenticated
 */
export default function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()
  const { isAuthenticated, loading } = useAuth()
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-blue-600 text-lg">
            Loading...
          </div>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
} 
