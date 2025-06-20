# User Flow Documentation

## Overview

This document defines the complete user journey through our AI-powered writing assistant web application. The flows are designed around Phase 1 core functionality (spell checking, grammar checking, document management) with Phase 2 considerations (LLM-powered suggestions and context integration) noted for future implementation.

**Target User**: Individuals writing engaging messages for networking and sales who want to develop their consistent voice while receiving quick, helpful suggestions.

---

## 1. High-Level User Journey

### Primary User Flow Map

```
Entry Point → Authentication → Document Management → Writing & Editing → Save & Reference
     ↓              ↓                    ↓                    ↓              ↓
Landing Page → Login/Signup → Dashboard/Sidebar → Text Editor → Auto-save → Context System
```

### Key User Goals
1. **Primary**: Write engaging, error-free messages with real-time assistance
2. **Secondary**: Build a library of reusable documents, which can be used as context for future documents
3. **Tertiary**: Develop consistent writing voice over time

---

## 2. Detailed User Flows

### 2.1 Initial Entry & Authentication Flow

#### 2.1.1 New User Journey
**Entry Point**: Landing page (direct URL or referral)

**High-Level Flow**:
```
Landing Page → Sign Up Form → Email Verification → Welcome/Onboarding → Dashboard
```

**Detailed Steps**:
1. **Landing Page**
   - User arrives at homepage
   - Sees value proposition and product demo
   - Primary CTA: "Start Writing" or "Get Started"
   - Secondary CTA: "Login" (for returning users)

2. **Sign Up Process**
   - Email address input
   - Password creation (with strength indicator)
   - Optional: Name input
   - Terms acceptance checkbox
   - Submit → Account creation

3. **Email Verification** (Optional for Phase 1)
   - Verification email sent
   - User clicks verification link
   - Account activated

4. **Post-login Experience**
   - New draft document is created automatically and ready to be edited, eliminating barrier to writing
   - Sidebar shows document library, currently empty
   - Quick "New Document" access via sidebar at all times

#### 2.1.2 Returning User Journey
**Entry Point**: Landing page or direct dashboard URL

**Flow**:
```
Login Page → Credentials → Dashboard (with recent documents highlighted)
```

**Detailed Steps**:
1. **Login Form**
   - Email/username input
   - Password input
   - "Remember me" checkbox
   - "Forgot password" link
   - Submit → Authentication

2. **Post-login Experience**
   - New draft document is created automatically and ready to be edited, eliminating barrier to writing.
   - Immediate access to recent documents (sidebar shows document library)
   - Quick "New Document" access via sidebar at all times

### 2.2 Document Management Flow

#### 2.2.1 Document Creation
**Entry Points**: 
- Sidebar "+" icon
- Keyboard shortcut (Ctrl/Cmd + N)
- Can start writing immediately upon creation of a new document

**Flow**:
```
Trigger → Document Creation → Auto-naming → Editor Focus
```

**Detailed Steps**:
1. **Document Initialization**
   - System creates new document with auto-incrementing ID
   - Default title: "Untitled Document [ID]"
   - Blank text editor opens
   - Document appears in sidebar (unsaved state indicator)

2. **Initial State**
   - Cursor automatically focuses in editor
   - Placeholder text: "Start writing your message..."
   - Sidebar highlights new document
   - Auto-save begins immediately

#### 2.2.2 Document Management via Sidebar

**Sidebar Components**:
- Search bar at top
- "New Document" button
- Recently accessed documents (highlighted)
- All documents list (scrollable)

**Document List Interactions**:
1. **Click to Open**: Single click opens document in editor
2. **Rename**: Double-click on title or right-click menu
3. **Delete**: Right-click menu or delete key when selected
4. **Search**: Type in search bar for real-time filtering

**Search Functionality**:
- Real-time search as user types
- Searches document titles and content
- Highlights matching text
- Clear search "X" button

### 2.3 Core Writing & Editing Flow

#### 2.3.1 Text Editor Experience

**Editor Layout**:
```
[Sidebar] | [Main Editor Area] | [Suggestions Panel - Phase 2]
```

**Real-time Writing Flow**:
1. **Text Input**
   - User types in main editor
   - Real-time spell checking (red underlines)
   - Real-time grammar checking (blue underlines)
   - Auto-save every 30 seconds or after 3 seconds of inactivity

2. **Error Detection & Correction**
   - **Spell Check**: Right-click on or move text cursor to red underlined words for suggestions dropdown
   - **Grammar Check**: Right-click on or move text cursor to blue underlined text for corrections dropdown
   - Context-aware corrections (e.g., "Their/There/They're")
   - Keyboard shortcuts for quick corrections

3. **Writing Assistance** (Phase 1 Basic)
   - Word count display
   - Character count display
   - Basic readability indicator (Flesch-Kincaid Grade Level)

#### 2.3.2 Document Context System (Phase 2 Preparation)

**Context Reference Flow**:
```
Writing Document → Reference Another Document → Context Integration (Phase 2)
```

**Phase 1 Implementation**:
1. **Reference Creation**
   - User types document reference: `@DocumentName` or `#DocumentID`
   - Autocomplete dropdown shows matching documents
   - User selects document to reference
   - Reference appears as clickable link in editor

2. **Reference Display**
   - Referenced documents show as pills/tags
   - Click to open referenced document in new tab/modal
   - Visual indicator that document is being used as context

3. **Phase 2 Note**
   - In Phase 2, referenced documents will feed content to LLM
   - Context integration will provide advanced suggestions
   - Referenced content will be automatically included in prompts

### 2.4 Document Persistence & Auto-save Flow

#### 2.4.1 Auto-save System
**Continuous Flow**:
```
User Types → Content Change Detected → Auto-save Triggered → Status Updated
```

**Implementation**:
1. **Save Triggers**
   - 3 seconds after user stops typing
   - Every 30 seconds during active typing
   - When user clicks outside editor
   - When user switches to another tab or another document
   - When user closes web app

2. **Save Status Indicators**
   - "Saving..." indicator during save
   - "Saved" confirmation
   - "Error saving" with retry option
   - Unsaved changes indicator (*)

#### 2.4.2 Document Naming & Organization
**Naming Flow**:
1. **Auto-naming**
   - Default: "Untitled Document [ID]"
   
2. **Manual Naming**
   - Click on document title to edit
   - Enter key to save, Escape to cancel
   - Real-time validation (character limits, duplicates)

### 2.5 Advanced User Flows (Phase 2 Considerations)

#### 2.5.1 Context-Aware Suggestions (Future)
**Enhanced Flow**:
```
Writing → Context Analysis → LLM Processing → Suggestion Display → User Action
```

**Planned Features**:
- Real-time style and tone suggestions
- Content recommendations based on context documents
- Audience-aware writing suggestions
- Personality consistency scoring

#### 2.5.2 Multi-Document Context Workflow (Future)
**Workflow**:
1. Create any kind of context document (audience, news, facts about writer, etc.)
2. Create main message document
3. Reference context documents in main document (documents have a section for context referencing similar to Cursor AI's "Add Context" section)
4. Receive enhanced LLM suggestions based on all context

---

## 3. User Interface Flows

### 3.1 Navigation Patterns

#### 3.1.1 Primary Navigation
- **Sidebar**: Always visible document list and management
- **Main Editor**: Central focus area for writing, one document is always open and visible; empty document is created automatically upon login.
- **Top Bar**: Document title, user profile, settings

#### 3.1.2 Keyboard Navigation
- `Ctrl/Cmd + N`: New document
- `Ctrl/Cmd + S`: Manual save (though auto-save is primary)
- `Ctrl/Cmd + F`: Search documents
- `Esc`: Close modals/dropdowns

### 3.2 Responsive Design Considerations

#### 3.2.1 Desktop Experience (Primary)
- Full sidebar visibility
- Wide editor with comfortable line length
- Side-by-side context panels (Phase 2)

#### 3.2.2 Tablet Experience (Future consideration, low priority)
- Collapsible sidebar
- Full-width editor
- Touch-optimized buttons and interactions

#### 3.2.3 Mobile Experience (Future consideration, low priority)
- Hidden sidebar (accessible via menu)
- Mobile-optimized editor
- Simplified suggestion interface

---

## 4. Error States & Edge Cases (Future consideration, low priority)

### 4.1 Connection Issues
**Flow**: 
```
Connection Lost → Show Offline Indicator → Queue Changes → Reconnect → Sync Changes
```

### 4.2 Data Loss Prevention
- Local storage backup
- Conflict resolution for simultaneous edits
- Recovery options for unsaved changes

### 4.3 Document Management Errors
- Duplicate name handling
- Document deletion confirmation
- Bulk operation feedback

---

## 5. Performance & User Experience Considerations

### 5.1 Loading States
- Skeleton screens for document loading
- Progressive enhancement for editor features
- Lazy loading for document lists

### 5.2 User Feedback Systems
- Real-time save status
- Action confirmations
- Progress indicators for long operations
- Error messaging with clear next steps

### 5.3 Accessibility Features
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Adjustable font sizes

---

## 6. Success Metrics & Conversion Flows (Future consideration, low priority)

### 6.1 Key User Actions
1. **Activation**: Create first document
2. **Engagement**: Write 100+ words
3. **Retention**: Return within 7 days
4. **Value Realization**: Use spell/grammar suggestions

### 6.2 Conversion Opportunities (Future)
- Premium feature discovery
- Advanced suggestion benefits
- Collaboration invitations

---

## 7. Future State Considerations (Phase 2+)

### 7.1 Enhanced AI Integration
- Proactive writing suggestions
- Style consistency monitoring
- Audience-specific optimization
- Real-time collaboration features

### 7.2 Advanced Document Management
- Tagging system
- Advanced search with filters

### 7.3 Loading text from external sources
- Button to load text from external source (file, URL, etc.), expands into dropdown with options.
- File button: Load text from file by uploading file or by dragging and dropping file into editor
- Audio button: Load transcript from audio file by uploading audio file or by dragging and dropping audio file into editor
- URL button: Load text from URL by pasting URL into input field after clicking button
- Microphone button: Load text by speaking after clicking microphone button

### 7.3 Integration Capabilities (Future consideration, low priority)
- Email client integration
- Social media posting
- CRM system connections
- Analytics and insights

---

## Implementation Priority

### Phase 1 (MVP)
1. Authentication system
2. Basic document CRUD operations
3. Text editor with spell/grammar check
4. Auto-save functionality
5. Document referencing (visual only)

### Phase 2 (AI-Enhanced)
1. LLM integration for advanced suggestions
2. Style and tone analysis
3. Context-aware recommendations
4. Referenced document content integration
5. Loading text from external sources

### Future Phases
1. Advanced collaboration
2. Mobile applications
3. Third-party integrations
4. Analytics dashboard

---

This user flow document serves as the foundation for our UI/UX design decisions and technical architecture. Each flow should be validated through user testing and iteratively improved based on real user behavior and feedback. 
