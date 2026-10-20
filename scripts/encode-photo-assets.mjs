import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const manifest = process.argv[2] ?? '.tmp/imagegen-manifest.json';
const incremental = process.argv.includes('--incremental');
const assets = JSON.parse(await fs.readFile(manifest, 'utf8'));
const destination = 'public/assets/photos';
await fs.mkdir(destination, { recursive: true });
for (const asset of assets) {
  const output = path.join(destination, `${asset.id}.webp`);
  if (incremental) {
    try {
      await fs.access(output);
      continue;
    } catch {
      /* New generated asset. */
    }
  }
  await sharp(asset.source).webp({ quality: 84, effort: 5 }).toFile(output);
}
await fs.writeFile(
  path.join(destination, 'PROMPTS.json'),
  JSON.stringify(
    {
      generator: 'Built-in ImageGen',
      purpose: 'Original AI-generated photorealistic fashion demo imagery',
      assets: assets.map(({ id, prompt }) => ({ file: `${id}.webp`, prompt })),
    },
    null,
    2,
  ) + '\n',
);
await fs.writeFile(
  'src/data/generated-photos.json',
  JSON.stringify(
    assets.map((asset) => asset.id),
    null,
    2,
  ) + '\n',
);
console.log(`Encoded ${assets.length} original generated photos as WebP.`);
