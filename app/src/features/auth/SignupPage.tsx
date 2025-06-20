/**
 * SignupPage.tsx – User registration page
 * Handles new user account creation with email and password
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

/**
 * Signup page component
 * Provides user registration form with validation
 */
export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { signUp } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) return
    
    setIsLoading(true)

    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name
      })
      
      if (result.success) {
        // Check if email confirmation is required
        setError('Please check your email and click the confirmation link to complete your registration.')
        // Note: User will be redirected to /app automatically when they confirm their email
      } else {
        setError(result.error || 'Failed to create account. Please try again.')
      }
    } catch (error) {
      setError((error as Error).message || 'Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-6 font-sans">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-semibold text-primary-700 hover:text-primary-800 transition-colors duration-150">
            WordWise
          </Link>
          <h1 className="mt-4 text-3xl font-semibold text-neutral-900 leading-tight">
            Create your account
          </h1>
          <p className="mt-2 text-neutral-600 leading-relaxed">
            Start writing better today
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded shadow border border-neutral-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-error-50 border border-error-200 rounded">
                <p className="text-error-600 text-sm leading-relaxed">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-neutral-100 border border-neutral-200 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-colors duration-150"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
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
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-neutral-100 border border-neutral-200 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-colors duration-150"
                placeholder="Create a password"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-neutral-100 border border-neutral-200 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-colors duration-150"
                placeholder="Confirm your password"
              />
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                required
                className="w-4 h-4 mt-1 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-neutral-600">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-700 transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-700 transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-primary-500 text-white font-semibold rounded hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 shadow-sm"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-neutral-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-150 focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
