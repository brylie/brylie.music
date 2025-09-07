import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { rssSchema } from '@astrojs/rss';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using RSS schema with additional fields
	schema: ({ image }) =>
		rssSchema.extend({
			// Add custom fields beyond the RSS schema
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			// SEO-specific fields
			ogImage: image().optional(), // Custom Open Graph image
			keywords: z.array(z.string()).optional(), // SEO keywords
			canonicalURL: z.string().url().optional(), // Custom canonical URL
			robots: z.string().optional(), // Custom robots meta tag value
			author: z.string().optional(), // Article author
		}),
});

export const collections = { blog };
