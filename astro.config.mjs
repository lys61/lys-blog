import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lys-blog.pages.dev',
  integrations: [sitemap()]
});
