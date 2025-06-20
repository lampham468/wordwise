/**
 * App.tsx – Main application component
 * Root component that renders the writing assistant application with routing
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '@/features/auth/LoginPage'
import SignupPage from '@/features/auth/SignupPage'
import { Dashboard } from '@/features/dashboard/Dashboard'
import RequireAuth from '@/features/auth/RequireAuth'

/**
 * Main App component
 * Sets up routing structure for the application
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Protected routes */}
        <Route path="/app" element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        } />
        
        {/* Redirect unknown routes to login page */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
