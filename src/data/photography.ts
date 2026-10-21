import generated from './generated-photos.json' with { type: 'json' };

const available = new Set(generated);
export const photo = (id: string, fallback = '/assets/campaign.svg') =>
  available.has(id) ? `/assets/photos/${id}.webp` : fallback;
export const campaignHero = photo('campaign-hero');
export const homepageHero = photo('campaign-hero-wide', campaignHero);
export const collectionPhoto = (id: string) => photo(`collection-${id}`, campaignHero);
export const aboutPhoto = photo('about-atelier', campaignHero);
export function productPhotos(id: string, categoryId: string) {
  return (categoryId === 'accessories' ? ['ink'] : ['ink', 'sand', 'olive']).map((color, index) =>
    photo(`${id}-${color}`, `/assets/${categoryId}-${index}.svg`),
  );
}
export const categoryPhoto = (id: string, index: number) =>
  photo(
    `p-${String(index * 8 + 1).padStart(3, '0')}-sand`,
    photo(`p-${String(index * 8 + 1).padStart(3, '0')}-ink`, `/assets/${id}-1.svg`),
  );
