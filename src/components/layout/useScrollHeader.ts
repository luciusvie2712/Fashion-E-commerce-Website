import { useEffect, useRef } from 'react';

/** Direction hysteresis avoids flickering on trackpads and mobile bounce. */
export function useScrollHeader(routeKey: string) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    header.dataset.hidden = 'false';
    let previous = Math.max(0, window.scrollY);
    let distance = 0;
    let frame = 0;
    const show = () => {
      header.dataset.hidden = 'false';
      distance = 0;
    };
    const update = () => {
      frame = 0;
      const y = Math.max(
        0,
        Math.min(window.scrollY, document.documentElement.scrollHeight - innerHeight),
      );
      const delta = y - previous;
      previous = y;
      if (y < 16 || document.querySelector('[role="dialog"]')) {
        show();
        return;
      }
      if (Math.sign(delta) !== Math.sign(distance)) distance = 0;
      distance += delta;
      if (distance < -12) show();
      else if (distance > 16 && y > header.offsetHeight + 48) {
        header.dataset.hidden = 'true';
      }
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    header.addEventListener('focusin', show);
    window.addEventListener('scroll', scroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      header.removeEventListener('focusin', show);
      window.removeEventListener('scroll', scroll);
    };
  }, [routeKey]);
  return ref;
}
