import { it, expect } from 'vitest';
import { stories, faq } from '../data/content';
import { locales } from '../types/domain';
import { routeInventory, routeTitle } from '../app/route-inventory';
import { resources } from '../features/i18n/dictionaries';
it('all policy and FAQ bodies are authored in all five languages', () => {
  expect(faq).toHaveLength(8);
  for (const locale of locales) {
    for (const story of Object.values(stories))
      for (const paragraph of story) expect(paragraph[locale].trim().length).toBeGreaterThan(1);
    for (const pair of faq)
      for (const content of pair) expect(content[locale].trim().length).toBeGreaterThan(1);
  }
});
it('34 route patterns all have localized title keys', () => {
  expect(routeInventory).toHaveLength(34);
  for (const [path, key] of routeInventory) {
    expect(routeTitle(path.replace(':slug', 'example').replace(':id', 'example'))).toBe(key);
    for (const locale of locales) expect(resources[locale].translation[key]).toBeTruthy();
  }
});
