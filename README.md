# Brylie.music

Personal music website for Brylie Christopher featuring music releases, blog posts, and interactive musical applications.

## Features

- ✅ Music releases with Creative Commons licensing
- ✅ Blog posts about music and technology
- ✅ Interactive musical apps built with web standards
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and OpenGraph data
- ✅ Sitemap and RSS feed support
- ✅ Dark theme optimized design
- ✅ Responsive mobile-first layout

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/              # Static assets (images, CNAME, etc.)
├── src/
│   ├── components/      # Reusable Astro and Svelte components
│   │   └── apps/        # Interactive Svelte app components
│   ├── content/         # Content collections (type-safe markdown)
│   │   ├── blog/        # Blog posts
│   │   ├── releases/    # Music releases
│   │   └── apps/        # Musical apps metadata
│   ├── layouts/         # Page layouts
│   ├── pages/           # File-based routing
│   │   ├── apps/        # Musical apps section
│   │   ├── blog/        # Blog section
│   │   └── releases/    # Releases section
│   ├── styles/          # Global styles
│   └── utils/           # Utility functions (with tests)
├── astro.config.mjs     # Astro configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── vitest.config.ts     # Vitest test configuration
└── tsconfig.json        # TypeScript configuration
```

## Musical Apps

This site features interactive musical applications built with web standards (Svelte + TypeScript). Apps range from simple utilities like BPM calculators to more sophisticated tools for learning and creative music production.

**Current apps:**
- **BPM Calculator**: Convert tempo to millisecond durations for musical subdivisions

**Planned apps:**
- PianoFitness: Gamified piano learning tool
- Music-Reactive Animations: Creative visualization toolkit
- Scale Explorer: Interactive scale and mode reference

For details on app architecture, testing, and how to add new apps, see [src/content/APPS_README.md](src/content/APPS_README.md).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Installs dependencies                        |
| `npm run dev`     | Starts local dev server at `localhost:4321`  |
| `npm run build`   | Build your production site to `./dist/`      |
| `npm run preview` | Preview your build locally, before deploying |

## Technology Stack

- **Astro**: Static site generation with content collections
- **Svelte 5**: Interactive UI components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Vitest**: Fast unit testing
- **MDX**: Enhanced markdown with components

## 👀 Want to learn more?

- [Astro Documentation](https://docs.astro.build)
- [Svelte 5 Documentation](https://svelte.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vitest](https://vitest.dev/)

## License

Content and code are licensed under different terms:
- **Music & Content**: Creative Commons (CC-BY-4.0)
- **Source Code**: See LICENSE file

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Check out [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).
