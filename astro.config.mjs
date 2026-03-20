// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [mdx(), sitemap()],
	prefetch: {
		prefetchAll: true,
		defaultStrategy: 'viewport',
	},
	build: {
		inlineStylesheets: 'always',
	},
	fonts: [
		{
			name: 'Atkinson Hyperlegible',
			cssVariable: '--font-atkinson',
			provider: fontProviders.fontsource(),
		},
	],
	security: {
		csp: true,
	},
	experimental: {
		clientPrerender: true,
		rustCompiler: true,
		queuedRendering: {
			enabled: true,
		},
	},
});
