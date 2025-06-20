/**
 * WelcomePage.spec.tsx – Tests for WelcomePage component
 * Verifies the welcome page renders correctly
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import WelcomePage from './WelcomePage'

describe('WelcomePage', () => {
  it('renders welcome message', () => {
    render(<WelcomePage />)
    
    expect(screen.getByText('Hello, Writer')).toBeInTheDocument()
    expect(screen.getByText('Welcome to your AI-powered writing assistant')).toBeInTheDocument()
  })

  it('shows milestone completion status', () => {
    render(<WelcomePage />)
    
    expect(screen.getByText(/Milestone 0 Complete/)).toBeInTheDocument()
    expect(screen.getByText('React + TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument()
    expect(screen.getByText('Vite')).toBeInTheDocument()
  })

  it('displays ready status', () => {
    render(<WelcomePage />)
    
    expect(screen.getByText(/Ready for MVP development/)).toBeInTheDocument()
  })
}) 
