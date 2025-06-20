# UI Design Rules

> Authoritative guidelines for building **every screen, component, and interaction** in the writing-assistant web app.  These rules derive from the product brief, user-flow documentation, and Modern Minimalist aesthetic.

---

## 1 · Core Objectives

1. **Maintain writing flow** – the editor is the visual and cognitive center. UI elements must never obscure or steal focus from the text the user is composing.
2. **Deliver instant, low-stimulus feedback** – spelling/grammar underlines appear in ≤200 ms; LLM suggestions stream within 2 s. Loading states are subtle (opacity pulse), not blocking modals.
3. **Stay distraction-free** – neutral surfaces, single accent colour, minimal chrome. All advanced tools live in progressive-disclosure panels.
4. **Be fully responsive** – graceful down-scaling to 1024 px tablet; mobile MVP deferred but styles must collapse without overflow.
5. **Accessible by default** – WCAG AA contrast, keyboard-first navigation, `prefers-reduced-motion` respect.

---

## 2 · Layout & Spatial Model

| Region | Purpose | Behaviour |
|--------|---------|-----------|
| Sidebar (left) | Document list, search, new-doc action | Collapsible at `<1280px`; slides in over content at `<1024px>`. |
| Editor (center) | Primary text input | Always visible; gains focus on route change; max-width 800 px and auto-margin for readability. |
| Toolbar (top-sticky) | Basic formatting, word + char count | Shrinks to icon-only at `<768px>`. |
| Suggestion Popover | Accept/ignore actions | Anchored 8 px below underline; auto-dismiss on `Esc` or click-outside. |
| Toast Layer | Save states, errors | Bottom-right on desktop; top center on tablet. |

### Breakpoints
```
sm:  640px  – "phone portrait" (basic collapse)
md:  768px  – "small tablet" (toolbar icons)
lg: 1024px  – "tablet landscape" (sidebar overlay)
xl: 1280px  – default desktop
2xl:1536px  – wide desktop (two-pane context panel in Phase 2)
```
---

## 3 · Interaction Guidelines

1. **Inline Suggestions**
   - Underlines: red wavy = spelling; blue dashed = grammar; green dotted = style.
   - Hover → tooltip with first suggestion.
   - Click → popover list (max 5 items) with keyboard nav (`↑/↓`, `Enter`).
2. **Autosave Feedback**
   - Show "Saving..." text next to title when dirty.
   - Swap to check-mark ✅ + "Saved" for 1 s, then fade.
3. **LLM Enhancements**
   - While streaming, display ghost text in lighter neutral; commit on completion.
4. **Error Handling**
   - Non-blocking toast; never modal dialogs for network errors.
   - Retry button on toast triggers exponential back-off (handled in Zustand slice).

---

## 4 · Micro-Latency & Motion

| Event | Target Time | Feedback |
|-------|------------|----------|
| Key-press → spell underline | ≤150 ms | Underline fades in (`transition-opacity 75ms`). |
| "Improve Sentence" click → first tokens | ≤700 ms | Skeleton inline; caret shows spinner. |
| Doc Switch | ≤300 ms | Fade-through (`opacity 100ms`, `scale 95→100`). |

*Disable all scale animations* when `prefers-reduced-motion` is set.

---

## 5 · Accessibility Checklist

- `role="textbox" aria-multiline="true"` on editor.
- ARIA live-region `polite` for autosave status.
- All actionable icons have `aria-label`.
- Colour pairs meet 4.5:1 contrast; verify via automated CI check.

---

## 6 · Content & Tone

- Use second-person, encouraging language: "Try rephrasing this sentence."
- Avoid blame: "We found a spelling issue," not "You misspelled."
- Keep helper text ≤120 characters to reduce cognitive load.

---

## 7 · Common Pitfalls to Avoid

1. **Editor re-mounting** due to route key mis-use → loses cursor; keep `key` stable.
2. **Frequent Zustand state updates** on each keystroke → throttle network persistence.
3. Using `position: fixed` tooltips inside scroll container → causes mis-alignment; prefer Popper.js.
4. Forgetting to debounce spell-check → UI thread jank.

---

> Keep this file close while reviewing PRs. Any new pattern that deviates must be justified or added here. 
