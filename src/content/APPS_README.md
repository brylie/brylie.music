# Musical Apps

This directory contains interactive musical applications built with web standards. Apps range from simple utilities to sophisticated learning tools and creative applications.

## What & Why

### Purpose

The apps section showcases interactive musical tools that serve multiple audiences:

- **Musicians & Producers**: Utilities for timing, tuning, and production workflows
- **Music Students**: Learning tools for understanding musical concepts
- **Developers**: Creative applications demonstrating music-reactive animations and audio processing

### Philosophy

**Web-First, Standards-Based**
- Built with HTML, CSS, and JavaScript (via TypeScript)
- Works directly in browsers without installation
- Responsive design for desktop and mobile
- Accessible and performant

**Encapsulated & Portable**
- Each app is self-contained and reusable
- Can be extracted to standalone projects or npm packages
- Clean separation between business logic and UI

**Cross-Platform Ready**
- Web apps are the primary experience
- Optional distribution via iOS App Store and Google Play Store
- Consistent behavior across platforms

## Technology Stack

### Core Technologies

- **Astro.js**: Static site generation with content collections
- **Svelte 5**: Reactive UI components with modern runes API
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling with dark theme
- **Vitest**: Fast unit testing framework

### Libraries & Tools

- **astro-icon**: Icon system with MDI icon set
- **@testing-library/svelte**: Component testing utilities
- **jsdom**: DOM simulation for testing

## Structure

### Directory Layout

```text
src/
├── content/
│   └── apps/
│       ├── README.md (this file)
│       └── bpm-calculator.mdx (app metadata)
├── components/
│   └── apps/
│       └── BpmCalculator.svelte (interactive component)
├── pages/
│   └── apps/
│       ├── index.astro (apps listing page)
│       └── [...slug].astro (individual app pages)
└── utils/
    ├── bpm.ts (business logic)
    └── bpm.test.ts (unit tests)
```

### Content Collection Schema

Each app includes metadata defined in frontmatter:

```yaml
---
title: "BPM Calculator"
description: "Convert tempo to millisecond durations for musical subdivisions."
component: "BpmCalculator"  # Svelte component name
category: "rhythm"  # rhythm | learning | creative | utility
keywords:
  - "BPM"
  - "tempo"
  - "timing"
# Optional cross-platform URLs
appStoreUrl: "https://apps.apple.com/..."
playStoreUrl: "https://play.google.com/..."
webUrl: "https://standalone-app.example.com"
---
```

### Component Architecture

Apps follow a separation of concerns:

1. **Business Logic** (`src/utils/`)
   - Pure TypeScript functions
   - No UI dependencies
   - Fully unit tested
   - Easily portable to other projects

2. **UI Component** (`src/components/apps/`)
   - Svelte component for interactivity
   - Imports business logic from utils
   - Styled with Tailwind CSS
   - Uses `client:load` directive for hydration

3. **Content Entry** (`src/content/apps/`)
   - Markdown file with metadata
   - Explains the app's purpose and usage
   - Rendered below the interactive component

## How to Add a New App

### 1. Create Business Logic

Create a utility module in `src/utils/`:

```typescript
// src/utils/chord-finder.ts
export function findChords(notes: string[]): Chord[] {
  // Pure function logic
}
```

### 2. Write Tests

Create tests alongside your utility:

```typescript
// src/utils/chord-finder.test.ts
import { describe, it, expect } from 'vitest';
import { findChords } from './chord-finder';

describe('findChords', () => {
  it('identifies major triads', () => {
    expect(findChords(['C', 'E', 'G'])).toEqual([{ name: 'C Major' }]);
  });
});
```

### 3. Build Svelte Component

Create an interactive component in `src/components/apps/`:

```svelte
<!-- src/components/apps/ChordFinder.svelte -->
<script lang="ts">
  import { findChords } from '../../utils/chord-finder';
  
  let notes = $state(['C', 'E', 'G']);
  let chords = $derived(findChords(notes));
</script>

<div class="chord-finder">
  <!-- UI implementation -->
</div>

<style>
  /* Tailwind-first, scoped CSS only for unique needs */
</style>
```

### 4. Create Content Entry

Add metadata and documentation with component import:

```mdx
<!-- src/content/apps/chord-finder.mdx -->
---
title: "Chord Finder"
description: "Identify chords from selected notes"
component: "ChordFinder"
category: "learning"
keywords: ["chords", "harmony", "music theory"]
---

import ChordFinder from '../../components/apps/ChordFinder.svelte';

# Chord Finder

<ChordFinder client:load />

Select notes on the keyboard to discover what chords they form...
```

**Note**: Using MDX (`.mdx` extension) allows importing and rendering Svelte components directly in the content. The component is embedded right where you want it to appear in the page layout.

### 5. Test & Deploy

```bash
# Run unit tests
npm test

# Start dev server
npm run dev

# Navigate to /apps/chord-finder
# Verify app works as expected

# Build for production
npm run build
```

## Testing Strategy

### Unit Tests (Required)

All business logic must be unit tested:

- Test pure functions in isolation
- Cover edge cases and error conditions
- Aim for high code coverage
- Fast execution (< 1ms per test)

### Component Tests (Optional)

Complex UI interactions can be tested with `@testing-library/svelte`:

- Test user interactions (clicks, input)
- Verify reactive state updates
- Check accessibility (ARIA labels, keyboard nav)

### Manual Testing Checklist

- [ ] App renders correctly on desktop
- [ ] App works on mobile viewport
- [ ] Dark theme styling is consistent
- [ ] Animations are smooth (60fps)
- [ ] Inputs validate appropriately
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes

## Independent Publishing

Apps are designed for easy extraction:

### As npm Package

```bash
# Create new package
mkdir bpm-calculator
cd bpm-calculator
npm init

# Copy files
cp src/utils/bpm.ts .
cp src/components/apps/BpmCalculator.svelte .

# Add dependencies
npm install svelte
npm install -D typescript vitest

# Publish
npm publish
```

### As Standalone Web App

```bash
# Create Vite + Svelte project
npm create vite@latest bpm-calculator-app -- --template svelte-ts

# Copy component and utilities
cp src/components/apps/BpmCalculator.svelte src/
cp src/utils/bpm.ts src/

# Deploy to Vercel/Netlify/Cloudflare Pages
```

### As Mobile App

Use frameworks like:
- **Capacitor**: Web app to iOS/Android
- **Tauri**: Web app to native desktop
- **Expo**: React Native (requires porting from Svelte)

## Examples

### Current Apps

- **BPM Calculator**: Converts tempo to millisecond values for musical subdivisions
  - Category: Rhythm
  - Features: Real-time calculation, dotted/triplet variations
  - Use cases: Audio production, delay timing, animation sync

### Planned Apps

- **PianoFitness**: Gamified piano learning and practice tool
- **Music-Reactive Animations**: Creative toolkit for visualizing audio
- **Scale Explorer**: Interactive scale and mode reference
- **Metronome**: Customizable rhythm practice tool

## Contributing

When adding apps:

1. **Keep it focused**: Each app should do one thing well
2. **Test thoroughly**: Business logic must have unit tests
3. **Document clearly**: Explain use cases and features in markdown
4. **Style consistently**: Follow Tailwind conventions and dark theme
5. **Consider accessibility**: ARIA labels, keyboard nav, screen readers
6. **Think portable**: Could this be useful as a standalone package?

## Resources

- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Svelte 5 Documentation](https://svelte.dev/docs)
- [Vitest Documentation](https://vitest.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (for audio-processing apps)
