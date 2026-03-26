import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import sharp from 'sharp';
import { SITE_TITLE, AUTHOR_NAME } from '../../consts';

const fontRegular = readFileSync(
	join(process.cwd(), 'public/fonts/atkinson-regular.woff')
);
const fontBold = readFileSync(
	join(process.cwd(), 'public/fonts/atkinson-bold.woff')
);

const contentDir = join(process.cwd(), 'src/content/blog');

async function getHeroBase64(postId: string): Promise<string | null> {
	// Try both .md and .mdx extensions
	for (const ext of ['.md', '.mdx']) {
		const filePath = join(contentDir, `${postId}${ext}`);
		if (!existsSync(filePath)) continue;

		const raw = readFileSync(filePath, 'utf-8');
		const match = raw.match(/heroImage:\s*['"]([^'"]+)['"]/);
		if (!match) return null;

		const imagePath = resolve(dirname(filePath), match[1]);
		if (!existsSync(imagePath)) return null;

		const buf = await sharp(imagePath)
			.resize(1200, 630, { fit: 'cover' })
			.jpeg({ quality: 80 })
			.toBuffer();
		return `data:image/jpeg;base64,${buf.toString('base64')}`;
	}
	return null;
}

export const getStaticPaths: GetStaticPaths = async () => {
	const posts = await getCollection('blog');
	return Promise.all(
		posts.map(async (post) => ({
			params: { slug: post.id },
			props: {
				title: post.data.title,
				subtitle: post.data.subtitle,
				description: post.data.description,
				pubDate: post.data.pubDate,
				tags: post.data.tags ?? [],
				author: post.data.author || AUTHOR_NAME,
				category: post.data.category,
				heroBase64: await getHeroBase64(post.id),
			},
		}))
	);
};

export const GET: APIRoute = async ({ props }) => {
	const { title, subtitle, description, pubDate, tags, author, category, heroBase64 } = props;

	const date = new Date(pubDate).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	const svg = await satori(
		{
			type: 'div',
			props: {
				style: {
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					background: 'linear-gradient(135deg, #0f1219 0%, #1a1f35 40%, #0d1b3e 70%, #0f1219 100%)',
					padding: '0',
					fontFamily: 'Atkinson',
					position: 'relative',
					overflow: 'hidden',
				},
				children: [
					// Hero image background (if available)
					...(heroBase64
						? [
								{
									type: 'img',
									props: {
										src: heroBase64,
										style: {
											position: 'absolute',
											top: '0',
											left: '0',
											width: '1200px',
											height: '630px',
											objectFit: 'cover' as const,
										},
									},
								},
								// Dark overlay for text readability
								{
									type: 'div',
									props: {
										style: {
											position: 'absolute',
											top: '0',
											left: '0',
											width: '1200px',
											height: '630px',
											background:
												'linear-gradient(135deg, rgba(10,14,24,0.93) 0%, rgba(15,18,25,0.88) 40%, rgba(13,27,62,0.82) 70%, rgba(10,14,24,0.75) 100%)',
										},
									},
								},
						  ]
						: []),
					// Decorative top accent bar
					{
						type: 'div',
						props: {
							style: {
								position: 'absolute',
								top: '0',
								left: '0',
								right: '0',
								height: '6px',
								background: 'linear-gradient(90deg, #2337ff 0%, #6366f1 40%, #8b5cf6 70%, #a855f7 100%)',
							},
						},
					},
					// Decorative glow circle (top right)
					{
						type: 'div',
						props: {
							style: {
								position: 'absolute',
								top: '-120px',
								right: '-80px',
								width: '400px',
								height: '400px',
								borderRadius: '50%',
								background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
							},
						},
					},
					// Decorative glow circle (bottom left)
					{
						type: 'div',
						props: {
							style: {
								position: 'absolute',
								bottom: '-100px',
								left: '-60px',
								width: '350px',
								height: '350px',
								borderRadius: '50%',
								background: 'radial-gradient(circle, rgba(35,55,255,0.12) 0%, transparent 70%)',
							},
						},
					},
					// Main content area
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'space-between',
								padding: '60px 64px 50px',
								height: '100%',
								position: 'relative',
								zIndex: '1',
							},
							children: [
								// Top section: category + tags
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											alignItems: 'center',
											gap: '12px',
											flexWrap: 'wrap',
										},
										children: [
											...(category
												? [
														{
															type: 'div',
															props: {
																style: {
																	background: 'rgba(99,102,241,0.25)',
																	border: '1px solid rgba(99,102,241,0.4)',
																	color: '#a5b4fc',
																	padding: '6px 16px',
																	borderRadius: '20px',
																	fontSize: '16px',
																	fontWeight: '700',
																	letterSpacing: '0.05em',
																	textTransform: 'uppercase' as const,
																},
																children: category,
															},
														},
												  ]
												: []),
											...tags.slice(0, 3).map((tag: string) => ({
												type: 'div',
												props: {
													style: {
														background: 'rgba(255,255,255,0.08)',
														border: '1px solid rgba(255,255,255,0.15)',
														color: 'rgba(255,255,255,0.6)',
														padding: '6px 14px',
														borderRadius: '20px',
														fontSize: '14px',
													},
													children: tag,
												},
											})),
										],
									},
								},
								// Middle section: title + description
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											flexDirection: 'column',
											gap: '16px',
											flex: '1',
											justifyContent: 'center',
										},
										children: [
											{
												type: 'div',
												props: {
													style: {
														fontSize: title.length > 50 ? '44px' : title.length > 30 ? '52px' : '62px',
														fontWeight: '700',
														color: '#ffffff',
														lineHeight: '1.15',
														letterSpacing: '-0.02em',
														maxWidth: '900px',
													},
													children: title,
												},
											},
											...(subtitle
												? [
														{
															type: 'div',
															props: {
																style: {
																	fontSize: '26px',
																	fontWeight: '400',
																	color: 'rgba(255,255,255,0.7)',
																	lineHeight: '1.4',
																	fontStyle: 'italic' as const,
																	maxWidth: '800px',
																},
																children: subtitle,
															},
														},
												  ]
												: [
														{
															type: 'div',
															props: {
																style: {
																	fontSize: '22px',
																	color: 'rgba(255,255,255,0.7)',
																	lineHeight: '1.5',
																	maxWidth: '750px',
																},
																children:
																	description.length > 120
																		? description.slice(0, 117) + '...'
																		: description,
															},
														},
												  ]),
										],
									},
								},
								// Bottom section: author, date, site name
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'flex-end',
										},
										children: [
											// Author + date
											{
												type: 'div',
												props: {
													style: {
														display: 'flex',
														alignItems: 'center',
														gap: '20px',
													},
													children: [
														// Author avatar circle
														{
															type: 'div',
															props: {
																style: {
																	width: '48px',
																	height: '48px',
																	borderRadius: '50%',
																	background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
																	display: 'flex',
																	alignItems: 'center',
																	justifyContent: 'center',
																	fontSize: '20px',
																	fontWeight: '700',
																	color: 'white',
																},
																children: author.charAt(0).toUpperCase(),
															},
														},
														{
															type: 'div',
															props: {
																style: {
																	display: 'flex',
																	flexDirection: 'column',
																	gap: '2px',
																},
																children: [
																	{
																		type: 'div',
																		props: {
																			style: {
																				fontSize: '20px',
																				fontWeight: '700',
																				color: '#ffffff',
																			},
																			children: author,
																		},
																	},
																	{
																		type: 'div',
																		props: {
																			style: {
																				fontSize: '16px',
																				color: 'rgba(255,255,255,0.65)',
																			},
																			children: date,
																		},
																	},
																],
															},
														},
													],
												},
											},
											// Site name
											{
												type: 'div',
												props: {
													style: {
														fontSize: '20px',
														fontWeight: '700',
														color: 'rgba(255,255,255,0.55)',
														letterSpacing: '0.02em',
													},
													children: SITE_TITLE,
												},
											},
										],
									},
								},
							],
						},
					},
				],
			},
		},
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: 'Atkinson',
					data: fontRegular,
					weight: 400,
					style: 'normal',
				},
				{
					name: 'Atkinson',
					data: fontBold,
					weight: 700,
					style: 'normal',
				},
			],
		}
	);

	const resvg = new Resvg(svg, {
		fitTo: { mode: 'width', value: 1200 },
	});
	const png = resvg.render().asPng();

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
};
