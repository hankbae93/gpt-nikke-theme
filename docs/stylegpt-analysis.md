# StyleGPT Architecture Analysis

ChatGPT custom theme extension reference. Analyzed for our NIKKE theme extension.

## Core Strategy

1. **Body class scoping**: `.pigeon-styles` on `<body>` toggles all custom styles
2. **Dynamic `<style>` tag injection**: CSS variable overrides injected at runtime
3. **Dark/Light toggle**: Direct manipulation of `html` class + `colorScheme`
4. **CSS variables only**: No inline styles on individual elements

## Dark/Light Mode Toggle

```javascript
// _funct.js
const html = document.getElementsByTagName('html')[0]
html.classList.remove('dark')
html.classList.add('light')
html.style.colorScheme = 'light'
localStorage.setItem('theme', 'light')
```

**Key**: `.light`/`.dark` must be on `<html>`, not child elements.

## CSS Variable System

### Base Variables (content.css)

| Variable | Dark | Light | Purpose |
|----------|------|-------|---------|
| `--pigeon-bg-color` | `var(--gray-900)` | `var(--gray-100)` | Primary bg |
| `--pigeon-bg-color-2` | `var(--gray-800)` | `var(--gray-50)` | Secondary bg |
| `--pigeon-bg-color-3` | `var(--gray-700)` | `white` | Tertiary bg |
| `--pigeon-text-color` | `var(--text-primary)` | `var(--text-primary)` | Text |

### Conversation Variables (dynamic, user-customizable)

| Variable | Default | Target |
|----------|---------|--------|
| `--pigeon-conversation-ai-bg-color` | `var(--pigeon-bg-color-2)` | AI message bg |
| `--pigeon-conversation-user-bg-color` | `var(--pigeon-bg-color-3)` | User message bg |
| `--pigeon-conversation-ai-color` | inherited | AI text color |
| `--pigeon-conversation-user-color` | inherited | User text color |
| `--pigeon-conversation-ai-font` | inherited | AI font |
| `--pigeon-conversation-user-font` | inherited | User font |
| `--pigeon-conversation-bg-color` | transparent | Chat area bg |
| `--pigeon-conversation-bg-img` | none | Chat bg image |
| `--pigeon-conversation-bg-img-size` | cover | Bg image size |
| `--pigeon-sidebar-bg-color` | `var(--pigeon-bg-color)` | Sidebar bg |

### UI Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `--pigeon-radius` | 30px | General border-radius |
| `--pigeon-btn-radius` | 20px | Button border-radius |
| `--pigeon-input-radius` | 50px | Input border-radius |
| `--pigeon-circle` | 100% | Circular elements |

## CSS Selectors by ChatGPT Component

### Conversation Area
```css
#__next {
  background: var(--pigeon-conversation-bg-color);
  background-image: var(--pigeon-conversation-bg-img);
}
```

### User Messages
```css
.flex-1.overflow-hidden > div > div > div > div:nth-child(even) > div[dir="auto"] > div:not([type="button"]) {
  background: var(--pigeon-conversation-user-bg-color);
  color: var(--pigeon-conversation-user-color);
  font-family: var(--pigeon-conversation-user-font);
}
/* Inner text elements: p, code, ul > li, span, b, i */
```

### AI Messages
```css
.flex-1.overflow-hidden > div > div > div > div:nth-child(odd) > div[dir="auto"] > div:not([type="button"]) {
  background: var(--pigeon-conversation-ai-bg-color);
  color: var(--pigeon-conversation-ai-color);
  font-family: var(--pigeon-conversation-ai-font);
}
/* Detection: :has(.relative.p-1.rounded-sm.h-9.w-9.text-white svg) */
```

### Message Container (both)
```css
.flex-1.overflow-hidden > div > div > div > div > div[dir="auto"] > div:not([type="button"]) {
  border-radius: var(--pigeon-radius);
  margin: 5px 0;
  overflow: hidden;
}
```

### Code Blocks
```css
div pre {
  border: 1px solid var(--gray-600);
  border-radius: var(--pigeon-btn-radius);
}
```

### Sidebar
```css
div:is(> div.h-full > div > div > div > nav) {
  border-radius: var(--pigeon-btn-radius);
  margin: 10px;
}

/* With .pigeon-styles */
.pigeon-styles div:has(> div.h-full > div > div > div > nav) {
  background-color: var(--pigeon-sidebar-bg-color);
}

/* Sidebar buttons */
nav .rounded-md,
nav .rounded-lg:not([data-headlessui-state] .rounded-lg),
nav li > a, nav div > a, nav div > button {
  border-radius: var(--pigeon-input-radius);
}
```

### Composer / Input
```css
div:is(> textarea),
div:has(> textarea) {
  border-radius: var(--pigeon-input-radius);
  padding-left: 20px;
  padding-right: 20px;
}

.btn-neutral, .rounded-sm {
  border-radius: var(--pigeon-input-radius);
}
```

### Header
```css
.sticky.top-0...bg-white\/95...dark\:bg-gray-800\/90 {
  background: transparent !important;
  border: none;
}
```

## Dynamic Style Tag Injection

### How it works

```javascript
// Creates style tag
this.stylesTag = document.createElement('style')
this.stylesTag.id = 'pp-stylegpt-menu-styles-css'
document.head.appendChild(this.stylesTag)

// Generates CSS from storage values
_convertStylesToCSS(selector, styles, newValue) {
  // camelCase -> kebab-case
  // Replace {{value}} with actual value
  // Wrap with .pigeon-styles scope
  css = `.pigeon-styles ${selector} { ${properties} }`
  this.stylesTag.textContent += css
}
```

### Data flow
```
User changes input
  -> _onInputEvent.js -> _changeData() -> updates chrome.storage
  -> storage.onChange -> _onChangeStorage.js
  -> setStylesTag() -> _convertStylesToCSS()
  -> injects into <style> tag
```

## Key Lessons for Our Extension

1. **Don't fight CSS variables with CSS variables** - ChatGPT's `@layer theme` has high priority. StyleGPT works because it uses its OWN variables, not overriding ChatGPT's.

2. **`.pigeon-styles` body class** = our `body.llm-nikke-chatting` (same pattern, already correct)

3. **Dark mode**: They toggle `html.dark`/`html.light` globally. This affects sidebar too. For thread-only theming, we need a different approach (physical overlay or scoped container).

4. **`#__next`** is the root conversation container - useful selector for background.

5. **Storage**: `chrome.storage.sync` for persistence across devices.

6. **nth-child selectors** for user vs AI messages are FRAGILE - better to use `data-message-author-role` attributes (which we already do).

7. **Style tag injection** is the recommended pattern for dynamic CSS - cleaner than inline styles.
