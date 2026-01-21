import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { rssSchema } from '@astrojs/rss';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using schema.org BlogPosting field names
	schema: ({ image }) =>
		z.object({
			// Core BlogPosting fields (schema.org names)
			title: z.string(),
			description: z.string(),
			datePublished: z.coerce.date(),
			dateModified: z.coerce.date().optional(),
			author: z.string().optional(),
			
			// Visual assets
			heroImage: image().optional(),
			ogImage: image().optional(), // Custom Open Graph image
			
			// SEO-specific fields
			keywords: z.array(z.string()).optional(), // SEO keywords
			canonicalURL: z.string().url().optional(), // Custom canonical URL
			robots: z.string().optional(), // Custom robots meta tag value
		}),
});

const releases = defineCollection({
	// Load Markdown and MDX files in the `src/content/releases/` directory.
	loader: glob({ base: './src/content/releases', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter for music releases
	schema: ({ image }) =>
		z.object({
			// Core metadata
			title: z.string(),
			description: z.string(),
			releaseDate: z.coerce.date(),

			// Album classification
			releaseType: z.enum(['album', 'ep', 'single', 'compilation']),
			genre: z.array(z.string()).optional(),

			// Creative Commons licensing (SPDX identifier)
			license: z.string().default('CC-BY-4.0'),
			licenseUrl: z.string().url().optional(),

			// Optional custom URL slug (defaults to kebab-case title)
			urlSlug: z.string().optional(),

			// Visual assets
			coverImage: image().optional(),
			ogImage: image().optional(),

			// Artist info
			artist: z.string().default('Brylie Christopher'),

			// Streaming platform links (alphabetically ordered)
			streamingLinks: z
				.object({
					appleMusic: z.string().url().optional(),
					bandcamp: z.string().url().optional(),
					fma: z.string().url().optional(), // Free Music Archive
					soundcloud: z.string().url().optional(),
					spotify: z.string().url().optional(),
					youtube: z.string().url().optional(),
				})
				.optional(),

			// YouTube video embed
			youtubeVideoId: z.string().optional(),

			// Track listing
			tracks: z
				.array(
					z.object({
						title: z.string(),
						duration: z.string(), // Human-readable format "4:32"
					}),
				)
				.optional(),

			// Optional metadata
			collaborators: z.array(z.string()).optional(),
			recordLabel: z.string().optional(),
			catalogNumber: z.string().optional(),

			// Download info (for RSS enclosure)
			downloadUrl: z.string().url().optional(),
			downloadSize: z.number().optional(), // Size in bytes
			downloadMimeType: z.string().optional(), // e.g., "audio/mpeg"

			// SEO fields
			keywords: z.array(z.string()).optional(),
			canonicalURL: z.string().url().optional(),
		}),
});

export const collections = { blog, releases };
