import { useEffect } from 'react';
import { waapi, type WAAPIAnimation } from 'animejs/waapi';

const targets = [
  '.hero-media > img',
  '.hero-copy > *',
  'main > section > h1',
  'main > section > h2',
  'main > section > p',
  'main > section > nav',
  '.section-heading',
  '.product-card',
  '.category-grid > a',
  '.collection-grid > a',
  '.collection-grid > article',
  '.review-grid > article',
  '.editorial > img',
  '.editorial > div > *',
  '.reading > img',
  '.reading > h2',
  '.reading > p',
  '.form > *',
  '.auth-page h1',
  '.auth-page p',
  '.auth-page form > *',
  '.gallery',
  '.purchase > *',
  '.summary',
  '.account-nav',
  '.order-card',
  '.cart-row',
  '.summary-panel',
  '.timeline > li',
  '.service-grid > article',
  '.account-layout h1',
  '.dialog-content > h2',
  '.dialog-content > p',
  '.dialog-content > img',
  '.dialog-content > .actions',
  '.empty',
  '.newsletter > *',
  '.footer-top > *',
].join(',');
const ownedProperties = ['opacity', 'clip-path', 'transform'];
type Reveal = {
  node: HTMLElement;
  running: Set<WAAPIAnimation>;
  touched: Set<HTMLElement>;
  delay: number;
};

/** Stable observer boxes; only their masks and inner content move. Text is never split. */
export function usePageMotion(routeKey: string) {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let stop = () => {};
    const configure = () => {
      stop();
      if (preference.matches || !('IntersectionObserver' in window) || !Element.prototype.animate)
        return;
      const nodes = new Map<HTMLElement, Reveal>();
      let disposed = false;
      const originals = new Map<HTMLElement, string[]>();
      const remember = (node: HTMLElement) => {
        if (!originals.has(node))
          originals.set(
            node,
            ownedProperties.map((key) => node.style.getPropertyValue(key)),
          );
      };
      const restore = (node: HTMLElement) => {
        originals.get(node)?.forEach((value, i) => {
          if (value) node.style.setProperty(ownedProperties[i], value);
          else node.style.removeProperty(ownedProperties[i]);
        });
      };
      const cancel = (record: Reveal) => {
        for (const animation of record.running) animation.cancel();
        record.running.clear();
      };
      const play = (
        record: Reveal,
        node: HTMLElement,
        params: Parameters<typeof waapi.animate>[1],
      ) => {
        remember(node);
        record.touched.add(node);
        const animation = waapi.animate(node, {
          ...params,
          onComplete: () => {
            record.running.delete(animation);
            restore(node);
          },
        });
        record.running.add(animation);
      };
      const reveal = (record: Reveal, visible: boolean) => {
        if (disposed) return;
        const { node } = record;
        if (node.matches(':focus-within')) visible = true;
        if (node.dataset.inView === String(visible)) return;
        if (node.dataset.inView === 'pending' && !visible) {
          node.dataset.inView = 'false';
          return;
        }
        const interrupted = record.running.size > 0;
        cancel(record);
        const computed = getComputedStyle(node);
        const opacity = computed.opacity;
        const clip = computed.clipPath === 'none' ? 'inset(0% 0% 0% 0%)' : computed.clipPath;
        node.dataset.inView = String(visible);
        const kind = node.dataset.revealKind;
        const duration = visible ? (kind === 'image' ? 950 : kind === 'heading' ? 780 : 650) : 230;
        const delay = visible ? record.delay : 0;
        play(record, node, {
          opacity: [opacity, visible ? 1 : 0],
          clipPath: [clip, visible ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 10% 0%)'],
          duration,
          delay,
          ease: visible ? 'outQuint' : 'inQuad',
        });
        const image = node.querySelector<HTMLElement>('.product-image img, :scope > img');
        if (image)
          play(record, image, {
            transform: [
              visible && !interrupted ? 'scale(1.045)' : getComputedStyle(image).transform,
              visible ? 'scale(1)' : 'scale(1.015)',
            ],
            duration: visible ? 1000 : 230,
            delay,
            ease: 'outQuint',
          });
        const copy = node.querySelectorAll<HTMLElement>(
          ':scope > .product-name, :scope > .price, :scope > span',
        );
        copy.forEach((child, index) =>
          play(record, child, {
            transform: [
              visible && !interrupted ? 'translateY(14px)' : getComputedStyle(child).transform,
              visible ? 'translateY(0px)' : 'translateY(-6px)',
            ],
            duration: visible ? 680 : 200,
            delay: visible ? delay + 50 + index * 35 : 0,
            ease: 'outQuint',
          }),
        );
      };
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const record = nodes.get(entry.target as HTMLElement);
            if (record) reveal(record, entry.isIntersecting);
          }
        },
        { threshold: 0 },
      );
      const collect = () => {
        if (disposed) return;
        document.querySelectorAll<HTMLElement>(targets).forEach((node) => {
          if (nodes.has(node)) return;
          const kind = node.matches('img')
            ? 'image'
            : node.matches('h1, h2, .section-heading, .hero-copy > *')
              ? 'heading'
              : 'content';
          const index = node.parentElement ? [...node.parentElement.children].indexOf(node) : 0;
          const record: Reveal = {
            node,
            running: new Set(),
            touched: new Set(),
            delay: Math.min(index % 4, 3) * 65,
          };
          nodes.set(node, record);
          remember(node);
          node.classList.add('scroll-reveal');
          node.dataset.revealKind = kind;
          node.dataset.inView = 'pending';
          observer.observe(node);
        });
        for (const [node, record] of nodes) {
          if (!node.isConnected) {
            cancel(record);
            observer.unobserve(node);
            for (const child of record.touched) {
              restore(child);
              originals.delete(child);
            }
            originals.delete(node);
            nodes.delete(node);
          }
        }
      };
      const focus = (event: FocusEvent) => {
        let node = event.target instanceof HTMLElement ? event.target : null;
        while (node) {
          const record = nodes.get(node);
          if (record) {
            cancel(record);
            node.dataset.inView = 'true';
            for (const child of record.touched) restore(child);
            restore(node);
          }
          node = node.parentElement;
        }
      };
      collect();
      const mutations = new MutationObserver(collect);
      // Also discover Radix portal content, which lives outside the app's main element.
      mutations.observe(document.body, { childList: true, subtree: true });
      document.addEventListener('focusin', focus);
      stop = () => {
        disposed = true;
        observer.disconnect();
        mutations.disconnect();
        document.removeEventListener('focusin', focus);
        for (const [node, record] of nodes) {
          cancel(record);
          node.classList.remove('scroll-reveal');
          delete node.dataset.inView;
          delete node.dataset.revealKind;
        }
        for (const node of originals.keys()) restore(node);
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
