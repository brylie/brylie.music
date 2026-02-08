# Brylie.music

Personal music website featuring original music releases, blog posts about music and technology, and interactive musical applications.

## Features

- 🎵 Music releases with Creative Commons licensing
- ✍️ Blog posts exploring music theory and technology
- 🎹 Interactive musical apps (BPM calculators, scale explorers, and more)
- 🚀 100/100 Lighthouse performance score
- 🌙 Dark theme optimized design
- 📱 Responsive mobile-first layout
- 🔍 SEO-friendly with structured metadata

## Content

### Music Releases

Original compositions and albums available under Creative Commons licensing. Each release includes streaming links, album artwork, and detailed track information.

### Blog

Articles exploring the intersection of music and technology, including music theory concepts, production techniques, and creative coding approaches.

### Musical Apps

Interactive web applications built for musicians and music learners:

- **BPM Calculator**: Convert tempo to millisecond durations for musical subdivisions
- **Scale Explorer** _(planned)_: Interactive reference for scales and modes
- **PianoFitness** _(planned)_: Gamified piano learning tool
- **Music-Reactive Animations** _(planned)_: Creative visualization toolkit

For technical details on app architecture, see [src/content/APPS_README.md](src/content/APPS_README.md).

## Technology Stack

Built with modern web technologies:
- **Astro** for static site generation
- **Svelte 5** for interactive components
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Vitest** for testing

## Development

### Setup

```bash
npm install
```

### Commands

| Command           | Action                                     |
| :---------------- | :----------------------------------------- |
| `npm run dev`     | Start local dev server at `localhost:4321` |
| `npm run build`   | Build production site to `./dist/`         |
| `npm run preview` | Preview build locally before deploying     |
| `npm run test`    | Run unit tests with Vitest                 |
| `npm run test:ui` | Run tests with interactive UI              |

### Project Structure

```text
src/
├── components/       # Reusable UI components
│   └── apps/        # Interactive Svelte components
├── content/         # Content collections (blog, releases, apps)
├── layouts/         # Page templates
├── pages/           # File-based routing
├── styles/          # Global styles
└── utils/           # Utility functions with tests
```

For detailed coding conventions and guidelines, see [AGENTS.md](AGENTS.md).

## License

- **Content** (music, blog posts, images): [Creative Commons CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)
- **Source Code**: See [LICENSE](LICENSE) file
