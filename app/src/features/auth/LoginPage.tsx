/**
 * LoginPage.tsx – User login page
 * Handles user authentication with email and password
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

/**
 * Login page component
 * Provides email/password authentication form
 */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn({ email, password })
      if (result.success) {
        navigate('/app')
      } else {
        setError(result.error || 'Invalid email or password. Please try again.')
      }
    } catch (error) {
      setError((error as Error).message || 'Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl font-bold text-primary-700 hover:text-primary-800 transition-colors duration-150">
            WordWise
          </Link>
          <h1 className="mt-3 text-lg font-medium text-neutral-600 leading-relaxed">
            Built for better communication.
          </h1>
          <p className="mt-2 text-neutral-500 leading-relaxed">
            Sign in to continue writing
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded shadow border border-neutral-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-error-50 border border-error-200 rounded">
                <p className="text-error-600 text-sm leading-relaxed">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-100 border border-neutral-200 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-colors duration-150"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-100 border border-neutral-200 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-colors duration-150"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-neutral-600">Remember me</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-150 focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-primary-500 text-white font-semibold rounded hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 shadow-sm"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-neutral-600 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-150 focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
