// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import icon from 'astro-icon';
import Unfonts from 'unplugin-fonts/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://brylie.music',
  integrations: [ 
    mdx(), 
    sitemap({
      // Global defaults
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      
      // Filter out pages that shouldn't be indexed
      filter: (page) => {
        return !page.includes('/admin/') && 
               !page.includes('/draft/') && 
               !page.includes('/private/');
      },
      
      // Simple priority assignment based on URL patterns
      // TODO: Once frontmatter is accessible, use item.siteMapPriority || defaultPriority
      serialize(item) {
        // Homepage and about page get highest priority
        if (item.url === 'https://brylie.music/' || item.url === 'https://brylie.music/about/') {
          item.priority = 1.0;
        }
        
        // Blog pages get high priority
        if (item.url.includes('/blog/')) {
          item.priority = 0.9;
        }
        
        return item;
      },
      
      // XSL stylesheet for production (causes CORS in development)
      xslURL: '/sitemap.xsl'
    }), 
    icon(),
    Unfonts({
      fontsource: {
        families: ['Atkinson Hyperlegible']
      }
    })
  ],

  vite: {
    plugins: [ tailwindcss() ],
  },
});