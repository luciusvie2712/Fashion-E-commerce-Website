import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Maximize, Minus, Plus, ZoomIn, ZoomOut } from 'lucide-react';
import { Modal } from '../../components/ui';
import { LocalImage } from '../../components/shared';
import { colors } from '../../data/catalog';
import type { Product } from '../../types/domain';
import { useLocale } from '../i18n';
import { imageViewerCopy as copy } from './content';

export function ProductImageViewer({
  product,
  initialIndex,
  trigger,
}: {
  product: Product;
  initialIndex: number;
  trigger: ReactNode;
}) {
  const { locale } = useLocale();
  return (
    <Modal title={product.name[locale]} className="image-viewer-dialog" trigger={trigger}>
      <ImageViewerContent product={product} initialIndex={initialIndex} />
    </Modal>
  );
}

function ImageViewerContent({ product, initialIndex }: { product: Product; initialIndex: number }) {
  const { t, locale } = useLocale();
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, y: 0, left: 0, top: 0, active: false, moved: false });
  const count = product.imageUrls.length;
  const colorIds = [...new Set(product.variants.map((v) => v.colorId))];
  const colorName = (i: number) =>
    colors.find((c) => c.id === colorIds[i])?.name[locale] ?? `${i + 1}`;
  const changeImage = (next: number) => {
    setIndex((next + count) % count);
    setZoom(1);
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        setIndex((current) => (current + (event.key === 'ArrowRight' ? 1 : -1) + count) % count);
        setZoom(1);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [count]);
  useLayoutEffect(() => {
    const el = viewport.current;
    if (el)
      el.scrollTo((el.scrollWidth - el.clientWidth) / 2, (el.scrollHeight - el.clientHeight) / 2);
  }, [zoom, index]);
  return (
    <div className="image-viewer">
      <header className="image-viewer-header">
        <div>
          <p>
            FLUIVIX <span aria-hidden="true">/</span> {copy.gallery[locale]}
          </p>
          <h3>{product.name[locale]}</h3>
        </div>
        <span className="image-viewer-sku">{product.sku}</span>
      </header>
      <div className="image-viewer-stage">
        <div className="image-viewer-viewport" ref={viewport}>
          <button
            className="image-viewer-canvas"
            aria-label={zoom === 1 ? t('zoom') : copy.fit[locale]}
            aria-pressed={zoom > 1}
            style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}
            onClick={() => {
              if (!drag.current.moved) setZoom((current) => (current === 1 ? 2 : 1));
              drag.current.moved = false;
            }}
            onPointerDown={(event) => {
              drag.current.moved = false;
              if (zoom === 1 || event.pointerType !== 'mouse' || event.button !== 0) return;
              const el = viewport.current!;
              drag.current = {
                x: event.clientX,
                y: event.clientY,
                left: el.scrollLeft,
                top: el.scrollTop,
                active: true,
                moved: false,
              };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const state = drag.current;
              if (!state.active) return;
              const dx = event.clientX - state.x,
                dy = event.clientY - state.y;
              if (Math.abs(dx) + Math.abs(dy) > 5) state.moved = true;
              viewport.current!.scrollTo(state.left - dx, state.top - dy);
            }}
            onPointerUp={() => {
              drag.current.active = false;
            }}
            onPointerCancel={() => {
              drag.current.active = false;
            }}
            onLostPointerCapture={() => {
              drag.current.active = false;
            }}
          >
            <LocalImage
              key={index}
              className="zoom-image"
              src={product.imageUrls[index]}
              alt={`${product.name[locale]} · ${colorName(index)}`}
              draggable={false}
            />
          </button>
        </div>
        <button
          className="image-viewer-arrow image-viewer-prev"
          aria-label={copy.previous[locale]}
          disabled={count < 2}
          title={count < 2 ? copy.onlyImage[locale] : copy.previous[locale]}
          onClick={() => changeImage(index - 1)}
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <button
          className="image-viewer-arrow image-viewer-next"
          aria-label={copy.next[locale]}
          disabled={count < 2}
          title={count < 2 ? copy.onlyImage[locale] : copy.next[locale]}
          onClick={() => changeImage(index + 1)}
        >
          <ArrowRight size={20} aria-hidden="true" />
        </button>
        <span className="image-viewer-hint" aria-hidden="true">
          {zoom === 1 ? <ZoomIn size={15} /> : <ZoomOut size={15} />}
          {zoom === 1 ? copy.enlarge[locale] : copy.pan[locale]}
        </span>
      </div>
      <footer className="image-viewer-footer">
        <div className="image-viewer-caption" role="status">
          <span>
            {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </span>
          <strong>{colorName(index)}</strong>
        </div>
        <div className="image-viewer-tools" role="group" aria-label={copy.controls[locale]}>
          <button
            aria-label={copy.out[locale]}
            disabled={zoom <= 1}
            onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
          >
            <Minus size={17} aria-hidden="true" />
          </button>
          <output aria-live="polite">
            {new Intl.NumberFormat(locale, { style: 'percent' }).format(zoom)}
          </output>
          <button
            aria-label={t('zoom')}
            disabled={zoom >= 2.5}
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.5))}
          >
            <Plus size={17} aria-hidden="true" />
          </button>
          <button className="image-viewer-fit" onClick={() => setZoom(1)}>
            <Maximize size={15} aria-hidden="true" />
            {copy.fit[locale]}
          </button>
        </div>
        <div className="image-viewer-thumbnails" role="group" aria-label={copy.gallery[locale]}>
          {product.imageUrls.map((url, i) => (
            <button
              key={url}
              aria-label={`${String(i + 1).padStart(2, '0')} · ${t('color')}: ${colorName(i)}`}
              aria-pressed={index === i}
              onClick={() => changeImage(i)}
            >
              <LocalImage src={url} alt="" width="56" height="70" />
              <span>{String(i + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
        <p className="image-viewer-help">
          {count > 1 ? copy.keyboard[locale] : copy.onlyImage[locale]}
        </p>
      </footer>
    </div>
  );
}
