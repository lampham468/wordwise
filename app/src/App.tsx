/**
 * App.tsx – Main application component
 * Root component that renders the writing assistant application
 */

import AppShell from '@/components/AppShell'
import WelcomePage from '@/components/WelcomePage'

/**
 * Main App component
 * Renders the welcome page within the app shell layout for Milestone 0
 */
function App() {
  return (
    <AppShell>
      <WelcomePage />
    </AppShell>
  )
}

export default App
