import type { APIRoute } from 'astro';

const getRobotsTxt = (sitemapURL: URL) => `User-agent: *
Allow: /

# Sitemap
Sitemap: ${sitemapURL.href}

# Block access to admin areas (if any)
Disallow: /admin/
Disallow: /api/
Disallow: /.well-known/

# Allow all crawlers access to CSS and JS files
Allow: /*.css$
Allow: /*.js$
Allow: /*.jpg$
Allow: /*.jpeg$
Allow: /*.png$
Allow: /*.gif$
Allow: /*.svg$
Allow: /*.webp$
Allow: /*.woff$
Allow: /*.woff2$
Allow: /*.ttf$
Allow: /*.otf$
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site);
  return new Response(getRobotsTxt(sitemapURL), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
