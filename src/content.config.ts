import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { rssSchema } from '@astrojs/rss';

// OVL-synced catalog
// ───────────────────────────────────────────────────────────────────────────
// These collections are populated by `ovl site sync --site brylie-music`.
// Do NOT edit files under src/content/catalog/ manually — they are
// overwritten on every sync.
//
// Registered in OVL with:
//   ovl site add brylie-music sites/brylie-christopher \
//     --artist brylie-christopher \
//     --artists-dir src/content/catalog/artists \
//     --releases-dir src/content/catalog/releases \
//     --description "Brylie Christopher artist site"
//
// Schema mirrors:
//   schemas/artist.schema.json
//   schemas/release.schema.json   (OVL is canonical for status values)

const catalogArtists = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/catalog/artists' }),
	schema: z.object({
		schema_version: z.string(),
		id: z.string(),
		display_name: z.string(),
		legal_name: z.string().optional(),
		also_known_as: z.array(z.string()).optional(),
		bio: z.object({
			short: z.string(),
			medium: z.string().optional(),
			full: z.string().optional(),
		}),
		genre_tags: z.array(z.string()).optional(),
		contact: z.object({
			email: z.string().email().optional(),
			website: z.string().url().optional(),
		}).optional(),
		location: z.string().optional(),
		rights: z.object({
			pro: z.string().optional(),
			ipi_number: z.string().optional(),
			isni: z.string().optional(),
		}).optional(),
		distribution: z.object({
			distributor: z.string().optional(),
			artist_page_url: z.string().url().optional(),
		}).optional(),
		default_license: z.string().optional(),
		platforms: z.object({
			spotify_artist_id: z.string().optional(),
			apple_music_artist_id: z.string().optional(),
			youtube_channel_id: z.string().optional(),
			youtube_music_channel_id: z.string().optional(),
			bandcamp_url: z.string().url().optional(),
			soundcloud_url: z.string().url().optional(),
			instagram_handle: z.string().optional(),
			facebook_url: z.string().url().optional(),
			subvert_fm_url: z.string().url().optional(),
		}).optional(),
		members: z.array(z.string()).optional(),
		created_date: z.string(),
	}),
});

const catalogReleases = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/catalog/releases' }),
	schema: z.object({
		schema_version: z.string(),
		id: z.string(),
		title: z.string(),
		artist_id: z.string(),
		release_type: z.enum(['album', 'ep', 'single', 'compilation']),
		status: z.enum(['in-production', 'mastering', 'qc', 'ready', 'submitted', 'live', 'archived']),
		license: z.string(),
		description: z.object({
			short: z.string().optional(),
			full: z.string().optional(),
		}).optional(),
		genre_tags: z.array(z.string()).optional(),
		tracks: z.array(z.string()).optional(),
		dates: z.object({
			target_release: z.string().optional(),
			distributor_submission_deadline: z.string().optional(),
			submitted: z.string().optional(),
			released: z.string().optional(),
		}).optional(),
		distribution: z.object({
			distributor: z.string().optional(),
			upc: z.string().optional(),
			catalog_number: z.string().optional(),
		}).optional(),
		store_links: z.object({
			bandcamp: z.string().url().optional(),
			soundcloud: z.string().url().optional(),
			apple_music: z.string().url().optional(),
			spotify: z.string().url().optional(),
			youtube_music: z.string().url().optional(),
			tidal: z.string().url().optional(),
			amazon_music: z.string().url().optional(),
			fma: z.string().url().optional(),
			subvert_fm: z.string().url().optional(),
		}).optional(),
		created_date: z.string(),
	}),
});

// ─────────────────────────────────────────────────────────────────────────────

// Supported Creative Commons licenses (SPDX identifiers)
const CreativeCommonsLicense = z.enum([
	'CC-BY-4.0',    // Attribution 4.0 International
	'CC0-1.0',      // Public Domain Dedication
]);

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
			license: CreativeCommonsLicense.default('CC-BY-4.0'),
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

const apps = defineCollection({
	// Load Markdown and MDX files in the `src/content/apps/` directory.
	loader: glob({ 
		base: './src/content/apps', 
		pattern: '**/*.{md,mdx}'
	}),
	// Type-check frontmatter for musical apps/tools
	schema: ({ image }) =>
		z.object({
			// Core metadata
			title: z.string(),
			description: z.string(),
			
			// Component to embed (e.g., "BpmCalculator")
			component: z.string(),
			
			// Optional categorization
			category: z.enum(['rhythm', 'learning', 'creative', 'utility']).optional(),
			
			// Visual assets
			icon: image().optional(),
			ogImage: image().optional(),
			
			// Cross-platform publishing
			appStoreUrl: z.string().url().optional(), // iOS App Store
			playStoreUrl: z.string().url().optional(), // Google Play Store
			webUrl: z.string().url().optional(), // Standalone web app URL

			// Licensing
			license: CreativeCommonsLicense.optional(),

			// SEO fields
			keywords: z.array(z.string()).optional(),
			canonicalURL: z.string().url().optional(),
		}),
});

const media = defineCollection({
	// Load Markdown and MDX files in the `src/content/media/` directory.
	loader: glob({ 
		base: './src/content/media', 
		pattern: '**/*.{md,mdx}'
	}),
	// Type-check frontmatter using schema.org aligned fields
	schema: ({ image }) =>
		z.object({
			// Core metadata (schema.org aligned)
			title: z.string(),
			description: z.string(),
			datePublished: z.coerce.date(),
			dateModified: z.coerce.date().optional(),
			author: z.string().optional(),
			
			// Media type classification
			mediaType: z.enum(['video', 'audio', 'interactive']),
			
			// Media-specific metadata
			duration: z.string().optional(), // Human-readable format "4:32" (converted to ISO 8601 for Schema.org)
			resolution: z.string().optional(), // e.g., "1920x1080", "4K"
			
			// Platform identifiers (optional, at least one should be provided)
			youtubeId: z.string().optional(), // YouTube video ID
			iaIdentifier: z.string().optional(), // Internet Archive identifier
			videoUrl: z.string().optional().refine((val) => {
				if (!val) return true; // Optional field
				return /^(https?:\/\/|\/|\.\/)/.test(val);
			}, { message: "Must be an absolute URL (http/https) or relative path (/...)" }), // Direct video URL
			audioUrl: z.string().optional().refine((val) => {
				if (!val) return true; // Optional field
				return /^(https?:\/\/|\/|\.\/)/.test(val);
			}, { message: "Must be an absolute URL (http/https) or relative path (/...)" }), // Direct audio URL
			coverImage: image().optional(), // Thumbnail/poster image
			ogImage: image().optional(), // Custom Open Graph image
			
			// Licensing (Creative Commons SPDX identifier)
			license: CreativeCommonsLicense.default('CC-BY-4.0'),
			
			// Categorization and discovery
			topics: z.array(z.string()).optional(), // Tags/topics (e.g., ['music', 'modular', 'eurorack'])
			keywords: z.array(z.string()).optional(), // SEO keywords
			
			// Collaboration
			collaborators: z.array(z.string()).optional(),
			
			// SEO fields
			canonicalURL: z.string().url().optional(),
			robots: z.string().optional(),
		}).refine(
			data => Boolean(
				data.youtubeId ||
				data.iaIdentifier ||
				data.videoUrl ||
				data.audioUrl
			),
			{ message: 'At least one of youtubeId, iaIdentifier, videoUrl, or audioUrl must be provided' }
		),
});

export const collections = { blog, releases, apps, media, catalogArtists, catalogReleases };
