// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

const owner = process.env.GITHUB_REPOSITORY_OWNER;
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isUserSite = owner && repo === `${owner}.github.io`;
const site = process.env.SITE_URL || (owner ? `https://${owner}.github.io` : 'https://example.com');
const rawBase = process.env.BASE_PATH || (owner && repo && !isUserSite ? `/${repo}` : '/');
const base = rawBase === '/' ? '/' : `/${rawBase.replace(/^\/+|\/+$/g, '')}/`;

// https://astro.build/config
export default defineConfig({
	site,
	base,
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
