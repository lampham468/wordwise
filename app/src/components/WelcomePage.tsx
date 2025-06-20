/**
 * WelcomePage.tsx – Welcome page component
 * Displays the initial "Hello, Writer" message for Milestone 0
 */

/**
 * WelcomePage component shows the initial welcome message
 * This is a placeholder for Milestone 0 setup verification
 */
export function WelcomePage() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-neutral-900">
            Hello, Writer
          </h1>
          <p className="text-lg text-neutral-600">
            Welcome to your AI-powered writing assistant
          </p>
        </div>
        
        <div className="space-y-4 text-sm text-neutral-500">
          <p>
            🎯 <strong>Milestone 0 Complete:</strong> Project setup successful
          </p>
          <div className="flex items-center justify-center space-x-4">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-success-500 rounded-full"></span>
              <span>React + TypeScript</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-success-500 rounded-full"></span>
              <span>Tailwind CSS</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-success-500 rounded-full"></span>
              <span>Vite</span>
            </span>
          </div>
        </div>
        
        <div className="pt-4">
          <p className="text-xs text-neutral-400">
            Ready for MVP development 🚀
          </p>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage 
