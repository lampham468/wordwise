# Theme Rules · Modern Minimalist

> A single source of truth for **colours, typography, spacing, and visual tokens** used across the application.
> Implemented via Tailwind CSS 3.4 design tokens (`tailwind.config.ts`).

---

## 1 · Colour Palette

### Current Implementation (Tailwind CSS 3.4)

| Token | HEX | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| **Primary Colors** | | | |
| Primary 50 | `#f0f9ff` | Light primary backgrounds | `bg-primary-50` |
| Primary 500 | `#0ea5e9` | Primary buttons, links | `bg-primary-500` |
| Primary 600 | `#0284c7` | Primary hover states | `bg-primary-600` |
| **Neutral Colors** | | | |
| Neutral 50 | `#fafafa` | Main app background | `bg-neutral-50` |
| Neutral 100 | `#f5f5f5` | Sidebar, card backgrounds | `bg-neutral-100` |
| Neutral 200 | `#e5e5e5` | Subtle borders | `border-neutral-200` |
| Neutral 300 | `#d4d4d4` | Component borders | `border-neutral-300` |
| Neutral 600 | `#525252` | Secondary text | `text-neutral-600` |
| Neutral 900 | `#171717` | Primary text | `text-neutral-900` |
| **Semantic Colors** | | | |
| Success 500 | `#22c55e` | Success states | `bg-success-500` |
| Warning 500 | `#f59e0b` | Grammar underlines | `border-warning-500` |
| Error 500 | `#ef4444` | Spelling underlines | `border-error-500` |

### Tailwind Config Implementation
Current `tailwind.config.ts` structure:
```ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          // ... full scale
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          // ... full scale
        },
        success: {
          500: '#22c55e',
        },
        warning: {
          500: '#f59e0b',
        },
        error: {
          500: '#ef4444',
        },
      },
    },
  },
};
```

---

## 2 · Typography

### Current Implementation

| Token | Font | Size | Weight | Tailwind Classes |
|-------|------|------|--------|------------------|
| Body Text | Inter, system-ui | 1rem (16px) | 400 | `font-sans text-base` |
| Headings | Inter, system-ui | Responsive | 600 | `font-sans font-semibold` |
| Monospace | JetBrains Mono, Consolas | 0.95rem | 400 | `font-mono` |

**Font Configuration:**
```ts
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Consolas', 'monospace'],
}
```

**Line Heights:** 
- Body: `1.6` (`leading-relaxed`)
- Headings: `1.2` (`leading-tight`)

---

## 3 · Spacing & Sizing Scale

### Tailwind CSS Default Scale (Current)
```
0   | 0
1   | 0.25rem (4px)
2   | 0.5rem  (8px)
3   | 0.75rem (12px)
4   | 1rem    (16px)
5   | 1.25rem (20px)
6   | 1.5rem  (24px)
8   | 2rem    (32px)
12  | 3rem    (48px)
16  | 4rem    (64px)
```

### Custom Extensions
```ts
spacing: {
  '18': '4.5rem',    // 72px
  '88': '22rem',     // 352px
},
maxWidth: {
  'prose': '65ch',
  'editor': '800px',
},
```

**Border Radius:** 
- Default: `4px` (`rounded`)
- Full: `9999px` (`rounded-full`)

---

## 4 · Shadows & Elevation

### Current Implementation

| Level | Tailwind Class | Usage |
|-------|----------------|-------|
| Subtle | `shadow-sm` | Button focus, input highlights |
| Default | `shadow` | Cards, popovers |
| Large | `shadow-lg` | Modals, suggestion panels |

**Custom Shadows:** Following Tailwind's default shadow system.

---

## 5 · Component Patterns

### Current CSS Classes

**Spell Check Underlines (Custom CSS):**
```css
.spell-error {
  border-bottom: 2px wavy theme('colors.error.500');
}

.grammar-error {
  border-bottom: 2px dashed theme('colors.warning.500');
}

.style-suggestion {
  border-bottom: 2px dotted theme('colors.primary.500');
}
```

**Common Component Patterns:**
- **Primary Button**: `bg-primary-500 text-white hover:bg-primary-600 focus:ring-2 focus:ring-primary-500`
- **Input Field**: `bg-neutral-100 border border-neutral-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500`
- **Card**: `bg-white border border-neutral-200 rounded shadow-sm`

---

## 6 · Layout Constants

### CSS Custom Properties
```css
:root {
  --editor-max-width: 800px;
  --sidebar-width: 280px;
  --toolbar-height: 60px;
}
```

### Utility Classes
```css
.prose {
  max-width: var(--editor-max-width);
  margin: 0 auto;
}

.sidebar-width {
  width: var(--sidebar-width);
}

.toolbar-height {
  height: var(--toolbar-height);
}
```

---

## 7 · Motion & Animation

### Current Implementation

| Purpose | Duration | Easing | Tailwind Classes |
|---------|----------|--------|------------------|
| Fade-in | 150ms | ease-in-out | `transition-opacity duration-150` |
| Slide-in | 200ms | ease-out | `transition-transform duration-200` |
| Hover states | 75ms | ease-out | `transition-colors duration-75` |

**Custom Animations:**
```ts
animation: {
  'fade-in': 'fadeIn 0.15s ease-in-out',
  'slide-in': 'slideIn 0.2s ease-out',
  'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
},
```

**Reduced Motion:** Handled via `@media (prefers-reduced-motion: reduce)` in global CSS.

---

## 8 · Responsive Breakpoints

### Tailwind CSS Default Breakpoints
```
sm:  640px  – Small tablets/large phones
md:  768px  – Tablets
lg:  1024px – Small laptops
xl:  1280px – Desktop
2xl: 1536px – Large desktop
```

### Layout Behavior
- **Sidebar**: Full width on mobile, overlay on tablet (`lg`), fixed on desktop (`xl`)
- **Editor**: Max-width constrained with auto margins
- **Toolbar**: Icon-only on mobile (`md`), full labels on desktop

---

> This theme system is implemented and working with Tailwind CSS 3.4. All colors, spacing, and typography follow Tailwind's proven conventions while maintaining our design goals.
