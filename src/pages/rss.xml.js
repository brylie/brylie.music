import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';

const parser = new MarkdownIt();

export async function GET(context) {
	const posts = await getCollection('blog');

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		stylesheet: '/rss/styles.xsl',
		customData: `<language>en-us</language>`,
		items: posts.map((post) => ({
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
		})),
	});
}
