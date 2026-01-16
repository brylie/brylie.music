import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import { buildLicenseUrl } from '../utils/license.ts';

const parser = new MarkdownIt();

// Helper function to validate URLs
const isValidUrl = (url) => {
	try {
		const parsed = new URL(url);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
};

// Shared sanitize options
const sanitizeOptions = {
	allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]),
	allowedAttributes: {
		...sanitizeHtml.defaults.allowedAttributes,
		img: [ 'src', 'alt', 'title', 'width', 'height' ],
		a: [ 'href', 'title', 'target', 'rel' ],
	},
};

export async function GET(context) {
	const posts = await getCollection('blog');
	const releases = await getCollection('releases');

	// Combine blog posts and releases into a single feed
	const blogItems = posts.map((post) => ({
		...post.data,
		link: `/blog/${post.id}/`,
		content: sanitizeHtml(parser.render(post.body), sanitizeOptions),
	}));

	const releaseItems = releases.map((release) => {
		const slug = release.data.urlSlug || release.id;

		// Build and sanitize license info
		let licenseInfo = '';
		if (release.data.license) {
			const licenseUrl = buildLicenseUrl(release.data.license);
			if (isValidUrl(licenseUrl)) {
				const escapedLicense = sanitizeHtml(release.data.license, { allowedTags: [] });
				licenseInfo = sanitizeHtml(
					`<p><strong>License:</strong> <a href="${licenseUrl}" target="_blank" rel="noopener noreferrer">${escapedLicense}</a></p>`,
					sanitizeOptions
				);
			}
		}

		// Build and sanitize streaming links HTML
		let streamingLinks = '';
		if (release.data.streamingLinks) {
			const platformLabels = {
				appleMusic: 'Apple Music',
				bandcamp: 'Bandcamp',
				fma: 'Free Music Archive',
				soundcloud: 'SoundCloud',
				spotify: 'Spotify',
				youtube: 'YouTube Music',
			};

			const links = Object.entries(release.data.streamingLinks)
				.filter(([ _, url ]) => url && isValidUrl(url))
				.map(([ platform, url ]) => {
					const label = platformLabels[ platform ] || platform;
					const escapedLabel = sanitizeHtml(label, { allowedTags: [] });
					return `<a href="${url}" target="_blank" rel="noopener noreferrer">${escapedLabel}</a>`;
				})
				.join(' | ');

			if (links) {
				streamingLinks = sanitizeHtml(
					`<p><strong>Listen on:</strong> ${links}</p>`,
					sanitizeOptions
				);
			}
		}

		const content = sanitizeHtml(parser.render(release.body), sanitizeOptions);

		return {
			title: release.data.title,
			description: release.data.description,
			pubDate: release.data.releaseDate,
			link: `/releases/${slug}/`,
			content: `${content}${licenseInfo}${streamingLinks}`,
			categories: release.data.genre || [],
			...(release.data.downloadUrl && release.data.downloadSize && release.data.downloadMimeType
				? {
					enclosure: {
						url: release.data.downloadUrl,
						length: release.data.downloadSize,
						type: release.data.downloadMimeType,
					},
				}
				: {}),
		};
	});

	// Combine and sort all items by date
	const allItems = [ ...blogItems, ...releaseItems ].sort(
		(a, b) => new Date(b.pubDate) - new Date(a.pubDate)
	);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		stylesheet: '/rss/styles.xsl',
		customData: `<language>en-us</language>`,
		items: allItems,
	});
}
