/**
 * LandingPage.tsx – Landing page component
 * Entry point for new users with value proposition and CTAs
 */

import { Link } from 'react-router-dom'

/**
 * Landing page component
 * Shows value proposition and directs users to sign up or log in
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col font-sans">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="text-2xl font-semibold text-primary-700">
          WordWise
        </div>
        <nav className="flex gap-3">
          <Link 
            to="/login" 
            className="px-4 py-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-150 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Log In
          </Link>
          <Link 
            to="/signup" 
            className="px-6 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors duration-150 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl text-center">
          <h1 className="text-5xl font-semibold text-neutral-900 mb-6 leading-tight">
            Write Better, 
            <span className="text-primary-600"> Connect More</span>
          </h1>
          
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Craft engaging messages that get replies. Our AI-powered writing assistant 
            helps you develop your unique voice while handling grammar, spelling, and style.
          </p>

          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link 
              to="/signup" 
              className="px-8 py-4 bg-primary-500 text-white text-lg font-semibold rounded hover:bg-primary-600 transition-colors duration-150 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow"
            >
              Start Writing Free
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-4 border-2 border-neutral-300 text-neutral-700 text-lg font-semibold rounded hover:border-neutral-400 hover:bg-neutral-50 transition-colors duration-150 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              I Have an Account
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-primary-600 text-xl">✓</span>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2 leading-tight">Real-time Grammar & Spelling</h3>
              <p className="text-neutral-600 leading-relaxed">Catch errors as you type with context-aware corrections</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-primary-600 text-xl">📝</span>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2 leading-tight">Style Suggestions</h3>
              <p className="text-neutral-600 leading-relaxed">Improve clarity and engagement with smart recommendations</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-primary-600 text-xl">💾</span>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2 leading-tight">Auto-save Documents</h3>
              <p className="text-neutral-600 leading-relaxed">Never lose your work with automatic saving and sync</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-neutral-500">
        <p className="text-sm">&copy; Built for better communication.</p>
      </footer>
    </div>
  )
} 
