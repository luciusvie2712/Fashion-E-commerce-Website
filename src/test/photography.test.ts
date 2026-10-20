import fs from 'node:fs';
import path from 'node:path';
import { it, expect } from 'vitest';
import { products, categories, collections } from '../data/catalog';
import { campaignHero, collectionPhoto, aboutPhoto, categoryPhoto } from '../data/photography';
import generated from '../data/generated-photos.json';
import sharp from 'sharp';

it('all 48 products have local photographs for every available color', () => {
  expect(products).toHaveLength(48);
  for (const product of products) {
    const colors = [...new Set(product.variants.map((variant) => variant.colorId))];
    expect(product.imageUrls).toHaveLength(colors.length);
    for (const [index, image] of product.imageUrls.entries()) {
      expect(image).toBe(`/assets/photos/${product.id}-${colors[index]}.webp`);
      expect(fs.statSync(path.join('public', image)).size).toBeGreaterThan(1000);
    }
  }
});

it('all section/category imagery and 134 prompt records are bundled locally', () => {
  expect(generated).toHaveLength(134);
  expect(new Set(generated).size).toBe(134);
  const images = [
    campaignHero,
    aboutPhoto,
    ...collections.map((c) => collectionPhoto(c.id)),
    ...categories.map((c, index) => categoryPhoto(c.id, index)),
  ];
  for (const image of images) {
    expect(image).toMatch(/^\/assets\/photos\/.+\.webp$/);
    expect(fs.existsSync(path.join('public', image))).toBe(true);
  }
  const prompts = JSON.parse(fs.readFileSync('public/assets/photos/PROMPTS.json', 'utf8')) as {
    assets: { file: string; prompt: string }[];
  };
  expect(prompts.assets).toHaveLength(134);
  for (const item of prompts.assets) expect(item.prompt.length).toBeGreaterThan(40);
});

it('every generated photograph is a decodable high-resolution WebP', async () => {
  for (const id of generated) {
    const metadata = await sharp(`public/assets/photos/${id}.webp`).metadata();
    expect(metadata.format).toBe('webp');
    expect(metadata.width).toBeGreaterThanOrEqual(768);
    expect(metadata.height).toBeGreaterThanOrEqual(768);
  }
});
