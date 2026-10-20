import { useEffect } from 'react';

const targets = [
  'main > :not(.hero)',
  '.hero-copy > *',
  '.product-card',
  '.category-grid > a',
  '.collection-grid > a',
  '.review-grid > article',
  '.newsletter > *',
  '.footer-top > *',
].join(',');

/** Progressive enhancement: content stays visible without observer support. */
export function usePageMotion(routeKey: string) {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let stop = () => {};
    const configure = () => {
      stop();
      if (preference.matches || !('IntersectionObserver' in window)) return;
      const nodes = new Set<HTMLElement>();
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            (entry.target as HTMLElement).dataset.inView = String(entry.isIntersecting);
          }
        },
        { threshold: 0 },
      );
      const collect = () => {
        document.querySelectorAll<HTMLElement>(targets).forEach((node) => {
          if (nodes.has(node)) return;
          nodes.add(node);
          node.classList.add('scroll-reveal');
          node.dataset.inView = 'false';
          // Only small peer groups stagger; long catalogs never accumulate delays.
          const index = node.parentElement ? [...node.parentElement.children].indexOf(node) : 0;
          node.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 45}ms`);
          observer.observe(node);
        });
        for (const node of nodes) {
          if (!node.isConnected) {
            observer.unobserve(node);
            nodes.delete(node);
          }
        }
      };
      collect();
      const mutations = new MutationObserver(collect);
      for (const root of document.querySelectorAll('main, footer')) {
        mutations.observe(root, { childList: true, subtree: true });
      }
      stop = () => {
        observer.disconnect();
        mutations.disconnect();
        for (const node of nodes) {
          node.classList.remove('scroll-reveal');
          delete node.dataset.inView;
          node.style.removeProperty('--reveal-delay');
        }
      };
    };
    configure();
    preference.addEventListener('change', configure);
    return () => {
      stop();
      preference.removeEventListener('change', configure);
    };
  }, [routeKey]);
}
