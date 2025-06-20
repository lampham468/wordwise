# WordWise - AI Writing Assistant

An AI-powered writing assistant web application that helps users write engaging messages for networking and sales. Built with React, TypeScript, and Supabase.

## 🎯 Project Status

**Milestone 0 (Setup) - ✅ COMPLETE**
- ✅ Project structure and toolchain configured
- ✅ React 19 + TypeScript 5.8 + Vite 6 setup
- ✅ Tailwind CSS 3.4 styling system
- ✅ Supabase project initialized
- ✅ CI/CD pipeline configured
- ✅ Development environment ready
- ✅ NPM workspace configuration working

**Next: Milestone 1 (MVP) - Core Writing Assistant Features**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd wordwise
   npm install
   cd app && npm install
   ```

2. **Set up environment variables:**
   ```bash
   cd app
   cp env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Start development server:**
   ```bash
   # From root directory
   npm run dev
   
   # Or from app directory
   cd app && npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 🏗️ Architecture

### Frontend (`/app`)
- **React 19** with TypeScript 5.8
- **Vite 6.3** for fast development and building
- **Tailwind CSS 3.4** for styling
- **Zustand 5** for state management
- **TipTap 2.14** for rich text editing
- **Vitest 3.2** for testing

### Backend (`/supabase`)
- **Supabase Postgres** database
- **Supabase Auth** for authentication
- **Edge Functions** for serverless API endpoints

## 📁 Project Structure

```
wordwise/
├── app/                    # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Feature-specific modules
│   │   ├── hooks/          # Custom React hooks
│   │   ├── stores/         # Zustand state stores
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── test/           # Test setup and utilities
│   ├── public/             # Static assets
│   └── dist/               # Build output
├── supabase/               # Backend infrastructure
│   ├── migrations/         # Database migrations
│   └── functions/          # Edge Functions
├── project-management/     # Project documentation
└── .github/workflows/      # CI/CD pipelines
```

## 🛠️ Available Scripts

### Root Level (NPM Workspaces)
```bash
npm run dev        # Start frontend development server
npm run build      # Build for production
npm run test       # Run tests
npm run lint       # Run linter
npm run type-check # TypeScript type checking
```

### Frontend (`/app`)
```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run test       # Run Vitest tests
npm run test:ui    # Run tests with UI
npm run lint       # ESLint with max warnings = 0
npm run format     # Format code with Prettier
```

## 🎨 Design System

The application uses a custom design system built with Tailwind CSS 3.4:

- **Colors**: Primary (blue), Neutral (grays), Semantic (success, warning, error)
- **Typography**: Inter font family with responsive sizing
- **Spacing**: Consistent spacing scale following Tailwind conventions
- **Components**: Reusable UI components following accessibility standards

## 🧪 Testing

- **Unit Tests**: Vitest with React Testing Library
- **Test Coverage**: Minimum 80% line coverage required
- **Test Location**: Colocated with components (`*.spec.tsx`)

## 🚀 Deployment

The application is configured for deployment on:
- **Frontend**: Vercel (automatic deployments from main branch)
- **Backend**: Supabase (managed infrastructure)

## 📋 Development Workflow

1. **Feature Development**: Create feature branches from `main`
2. **Code Quality**: All PRs must pass CI checks (lint, test, build)
3. **Code Review**: Peer review required before merging
4. **Documentation**: Update relevant docs with new features

## 🔧 Configuration

### ESLint
- TypeScript-aware linting
- React and accessibility rules
- Zero warnings policy

### Prettier
- Consistent code formatting
- Automatic formatting on save

### Tailwind CSS 3.4
- Custom design tokens
- Responsive design utilities
- Proven stable release

## 📚 Technology Stack

### Current Versions
- **React**: 19.1.0
- **TypeScript**: 5.8.3
- **Vite**: 6.3.5
- **Tailwind CSS**: 3.4.4
- **Zustand**: 5.0.5
- **TipTap**: 2.14.1
- **Vitest**: 3.2.4

### Key Features (Planned)

#### Phase 1 (MVP)
- [ ] User authentication
- [ ] Document management
- [ ] Rich text editor with TipTap
- [ ] Real-time spell checking
- [ ] Grammar checking
- [ ] Auto-save functionality

#### Phase 2 (Advanced)
- [ ] AI-powered writing suggestions
- [ ] Context-aware recommendations
- [ ] Writing style analysis
- [ ] Document templates
- [ ] Collaboration features

## 🤝 Contributing

1. Follow the project structure and naming conventions
2. Write tests for new features
3. Ensure all CI checks pass
4. Update documentation as needed
5. Keep files under 500 lines for AI compatibility

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for better writing** 
