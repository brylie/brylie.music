import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';

const parser = new MarkdownIt();

export async function GET(context) {
	const posts = await getCollection('blog');
	const releases = await getCollection('releases');

	// Combine blog posts and releases into a single feed
	const blogItems = posts.map((post) => ({
		...post.data,
		link: `/blog/${post.id}/`,
		content: sanitizeHtml(parser.render(post.body), {
			allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]),
			allowedAttributes: {
				...sanitizeHtml.defaults.allowedAttributes,
				img: [ 'src', 'alt', 'title', 'width', 'height' ],
				a: [ 'href', 'title', 'target', 'rel' ],
			},
		}),
	}));

	const releaseItems = releases.map((release) => {
		const slug = release.data.urlSlug || release.id;
		const licenseInfo = release.data.license
			? `<p><strong>License:</strong> <a href="https://creativecommons.org/licenses/${release.data.license.toLowerCase().replace('cc-', '').replace('-', '/')}/" target="_blank">${release.data.license}</a></p>`
			: '';

		// Build streaming links HTML
		const streamingLinks = release.data.streamingLinks
			? `<p><strong>Listen on:</strong> ${Object.entries(release.data.streamingLinks)
				.filter(([ _, url ]) => url)
				.map(([ platform, url ]) => {
					const platformLabels = {
						appleMusic: 'Apple Music',
						bandcamp: 'Bandcamp',
						fma: 'Free Music Archive',
						soundcloud: 'SoundCloud',
						spotify: 'Spotify',
						youtube: 'YouTube Music',
					};
					return `<a href="${url}" target="_blank" rel="noopener noreferrer">${platformLabels[ platform ] || platform}</a>`;
				})
				.join(' | ')}</p>`
			: '';

		const content = sanitizeHtml(parser.render(release.body), {
			allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]),
			allowedAttributes: {
				...sanitizeHtml.defaults.allowedAttributes,
				img: [ 'src', 'alt', 'title', 'width', 'height' ],
				a: [ 'href', 'title', 'target', 'rel' ],
			},
		});

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
