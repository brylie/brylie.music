# AI Coding Agent Guidelines

This document provides essential context for AI coding agents (Claude, Gemini, GitHub Copilot, etc.) working on this project.

## Project Overview

**brylie.music** is a personal music website built with modern web technologies, featuring:

- Music releases with Creative Commons licensing
- Blog posts about music and technology
- Interactive musical applications (Svelte-based)
- High performance (100/100 Lighthouse score)
- SEO-optimized with dark theme design

## Technology Stack

### Core Framework

- **Astro 5.x**: Static site generator with content collections
  - File-based routing in `src/pages/`
  - Type-safe content collections in `src/content/`
  - MDX support for enhanced markdown
  - Server-side rendering capabilities

### UI & Styling

- **Svelte 5**: Interactive components with runes (modern reactive patterns)
  - Use `$state`, `$derived`, `$effect` runes
  - Components in `src/components/` and `src/apps/`
- **Tailwind CSS 4.x**: Utility-first CSS framework
  - Modern Vite integration (`@tailwindcss/vite`)
  - Typography plugin for markdown styling
  - Custom configuration in `tailwind.config.js`

### Development

- **TypeScript 5.x**: Type-safe development
  - Strict mode enabled
  - Configuration in `tsconfig.json`
- **Vitest**: Fast unit testing framework
  - Tests adjacent to implementation (e.g., `bpm.test.ts`)
  - UI mode available: `npm run test:ui`
  - Configuration in `vitest.config.ts`

## Coding Conventions

### Astro Components

```astro
---
// TypeScript in frontmatter for SSR logic
import type { Props } from './types';
import ComponentName from './ComponentName.astro';

const { prop1, prop2 } = Astro.props;
---

<div class="container">
  <!-- Component JSX -->
</div>

<style>
  /* Component-scoped styles (or use Tailwind) */
</style>
```

### Svelte 5 Components

```svelte
<script lang="ts">
  // Use runes for reactive state
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  $effect(() => {
    // Side effects here
    console.log('Count changed:', count);
  });
</script>

<button onclick={() => count++}>
  Count: {count} (Doubled: {doubled})
</button>
```

### TypeScript

- Use explicit types for function parameters and return values (including `: void`)
- Prefer `interface` over `type` for object shapes
- Use `const` by default, `let` when mutation is needed
- Avoid `any`; use `unknown` if type is truly unknown

### Styling with Tailwind

- Prefer Tailwind utilities over custom CSS
- Use semantic class names when combining multiple utilities
- Dark theme optimized: use `dark:` variants sparingly
- Component-specific styles: use Astro's scoped `<style>` tags if needed

### File Organization

```text
src/
├── components/           # Reusable Astro/Svelte components
│   └── *.astro          # Layout components
├── content/             # Content collections (type-safe)
│   ├── blog/           # Blog posts (MDX)
│   ├── releases/       # Music releases (MD)
│   └── apps/           # App metadata (MDX)
├── layouts/            # Page layouts
├── pages/              # File-based routing
│   ├── apps/          # Musical apps routes
│   ├── blog/          # Blog routes
│   └── releases/      # Release routes
├── styles/            # Global CSS
└── apps/              # Interactive musical apps (Svelte + Logic + Tests)
```

## Content Collections

### Schema Definitions

Content collections use Zod schemas in `src/content.config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
  }),
});
```

### Testing Strategy

#### Unit Tests (Vitest)

- Test utility functions in isolation
- Place tests adjacent to implementation: `bpm.ts` → `bpm.test.ts`
- Use descriptive test names: `test('converts BPM to whole note duration', ...)`
- Run with `npm run test` or `npm run test:ui`

#### Example Test Structure

```typescript
import { describe, test, expect } from 'vitest';
import { functionName } from './module';

describe('functionName', () => {
  test('should handle normal case', () => {
    expect(functionName(input)).toBe(expectedOutput);
  });
  
  test('should handle edge case', () => {
    expect(functionName(edgeInput)).toBe(edgeOutput);
  });
});
```

## Musical Apps Guidelines

Interactive musical applications are built with Svelte and documented in `src/apps/README.md`.

### App Structure

- Component: `src/apps/AppName.svelte` (interactive UI)
- Logic: `src/apps/appName.ts` (business logic)
- Tests: `src/apps/appName.test.ts` (unit tests)
- Metadata: `src/content/apps/app-name.mdx` (description, documentation)

### App Best Practices

1. **Separation of Concerns**: Business logic in `.ts` files, UI in Svelte components, both co-located in `src/apps/`
2. **Type Safety**: TypeScript for all logic functions
3. **Testing**: Unit tests for all utility functions
4. **Accessibility**: WCAG 2.1 AA compliance (semantic HTML, ARIA labels)
5. **Performance**: Keep components lightweight, lazy-load when possible

## Git Workflow

### Branch Strategy

- `main`: Production-ready code
- Feature branches: `feature/description` or `fix/description`
- Create PR for review before merging

### Commit Messages

Follow conventional commits:

```text
feat(apps): add BPM calculator with millisecond subdivisions
fix(blog): correct date formatting in post metadata
docs(readme): update installation instructions
test(utils): add edge cases for bpm calculations
```

### Code Review Focus Areas

1. **Type Safety**: Ensure TypeScript types are properly defined
2. **Performance**: Check for unnecessary re-renders, large bundle sizes
3. **Accessibility**: Verify semantic HTML and ARIA attributes
4. **Testing**: Require tests for new utility functions
5. **Conventions**: Follow established patterns in existing code
6. **Documentation**: Update README/docs for significant changes

## Common Pitfalls to Avoid

### Astro

- ❌ Don't use React hooks in Astro components (use Svelte or vanilla JS)
- ❌ Don't import client components without proper directives
- ✅ Use `client:load`, `client:visible`, etc. for interactive islands

### Svelte 5

- ❌ Don't use legacy `$:` reactive statements (use `$derived` instead)
- ❌ Don't use `onMount` for simple effects (use `$effect` instead)
- ✅ Embrace runes: `$state`, `$derived`, `$effect`, `$props`

### TypeScript Common Errors

- ❌ Don't use `any` type
- ❌ Don't ignore TypeScript errors (fix them properly)
- ✅ Use explicit return types for functions
- ✅ Leverage type inference when appropriate

### Tailwind

- ❌ Don't create duplicate utility classes in custom CSS
- ❌ Don't use overly complex class strings (consider component extraction)
- ✅ Use Tailwind's built-in responsive and dark mode utilities

## Performance Considerations

1. **Image Optimization**: Use Astro's `<Image>` component with `sharp`
2. **Bundle Size**: Keep JavaScript minimal; prefer static HTML
3. **Lazy Loading**: Use `client:visible` for below-fold interactive components
4. **CSS**: Tailwind automatically purges unused styles
5. **Caching**: Leverage Astro's built-in static generation

## SEO Requirements

All pages should include:

- Canonical URLs
- OpenGraph metadata
- Twitter card metadata
- Descriptive page titles and meta descriptions
- Structured schema.org data where applicable

Implemented via `BaseHead.astro` component.

## Licensing

- **Content** (blog posts, releases, images): Creative Commons CC-BY-4.0
- **Source Code**: See LICENSE file
- Always include appropriate license headers in new files

## Resources

- [Astro Documentation](https://docs.astro.build)
- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)

---

**Note for AI Agents**: This document is authoritative for coding standards in this project. When in doubt, refer to existing code patterns and this documentation. Always prioritize type safety, accessibility, and performance.
