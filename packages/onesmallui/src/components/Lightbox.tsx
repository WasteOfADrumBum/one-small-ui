import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { useAnnouncer } from '../hooks/useAnnouncer';
import { useControllableState } from '../hooks/useControllableState';
import { useHotkeys } from '../hooks/useHotkeys';
import { useSwipe } from '../hooks/useSwipe';
import { useTransition } from '../hooks/useTransition';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { DownloadIcon } from '../icons/DownloadIcon';
import { ImageOffIcon } from '../icons/ImageOffIcon';
import { ZoomInIcon } from '../icons/ZoomInIcon';
import { ZoomOutIcon } from '../icons/ZoomOutIcon';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { Button } from './Button';
import { CloseButton } from './CloseButton';
import { Dialog, type DialogAnimation } from './Dialog';
import { EXIT_MS, type OverlayAppearance } from './DialogBase';
import { Spinner } from './Spinner';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';

export interface LightboxImage {
  src: string;
  /**
   * Required: what the image shows, read by screen readers and shown if it fails to load.
   * Use `''` only for a purely decorative image (it warns in development).
   */
  alt: string;
  srcSet?: string;
  sizes?: string;
  /** Shown under the image and linked to it with `aria-describedby`. */
  caption?: ReactNode;
  /** Smaller image for the thumbnail strip and LightboxGallery. Defaults to `src`. */
  thumbnail?: string;
  /** Shows a download link: `true` downloads `src`, a string downloads that URL (an original, say). */
  download?: string | boolean;
  /** Intrinsic size, so the layout is reserved before the image loads. */
  width?: number;
  height?: number;
}

export interface LightboxLabels {
  /** Visible and announced position. */
  counter: (n: number, total: number) => string;
  previous: string;
  next: string;
  close: string;
  zoomIn: string;
  zoomOut: string;
  /** Announced after a zoom from the keyboard, the buttons or a double tap. */
  zoom: (percent: number) => string;
  download: string;
  /** Names the thumbnail strip. */
  thumbnails: string;
  /** Name of each thumbnail button. */
  thumbnail: (n: number, total: number, alt: string) => string;
  loading: string;
  /** Shown, with the alt text, when an image fails to load. */
  error: string;
}

const defaultLabels: LightboxLabels = {
  counter: (n, total) => `${n} of ${total}`,
  previous: 'Previous image',
  next: 'Next image',
  close: 'Close image viewer',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  zoom: (percent) => `Zoom ${percent}%`,
  download: 'Download image',
  thumbnails: 'Thumbnails',
  thumbnail: (n, total, alt) => (alt ? `${alt}, image ${n} of ${total}` : `Image ${n} of ${total}`),
  loading: 'Loading image',
  error: 'This image couldn’t be loaded.',
};

export interface LightboxProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title' | 'children' | 'onChange'> {
  images: LightboxImage[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Names the dialog. Default "Image viewer". */
  'aria-label'?: string;
  /** Show a strip of thumbnail buttons under the image. */
  thumbnails?: boolean;
  /** Wrap from the last image to the first (and back). Default `false`: the ends stop. */
  loop?: boolean;
  /** Largest zoom factor. Default 4. */
  maxZoom?: number;
  /** Where focus goes on close: the opener (default), a specific element, or nowhere (`false`). */
  returnFocus?: boolean | RefObject<HTMLElement | null>;
  labels?: Partial<LightboxLabels>;
  /** Default `'dark'`, which re-scopes every token so photos sit on a dark surface. */
  appearance?: OverlayAppearance;
  animation?: DialogAnimation;
}

interface Zoom {
  scale: number;
  x: number;
  y: number;
}

const NO_ZOOM: Zoom = { scale: 1, x: 0, y: 0 };
const ZOOM_STEP = 0.5;
const PAN_STEP = 48;
const DOUBLE_TAP_MS = 300;
const TAP_SLOP = 10;


const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

// Consumer bundlers replace `process.env.NODE_ENV`; unbundled ESM has no `process`, so stay quiet there.
declare const process: { env: { NODE_ENV?: string } };
const isDev = () => {
  try {
    return process.env.NODE_ENV !== 'production';
  } catch {
    return false;
  }
};
let altWarned = false;
function warnEmptyAlt(images: LightboxImage[]) {
  if (altWarned || !isDev() || !images.some((img) => !img.alt.trim())) return;
  altWarned = true;
  console.warn('[@onesmall/ui] Lightbox: an image has empty alt text. Describe every image so screen reader users know what it shows.');
}

const isRtl = (el: Element) => el.closest('[dir]')?.getAttribute('dir') === 'rtl' || getComputedStyle(el).direction === 'rtl';

/**
 * A full-screen image viewer on `Dialog`: previous/next buttons, arrow keys (swapped in RTL),
 * Home/End, swipe, pinch and double-tap zoom, keyboard zoom and pan, an announced
 * "3 of 12" counter, captions, adjacent-image preloading, loading and error states, and an
 * optional thumbnail strip and download link. Open it from a button; focus returns there.
 */
export function Lightbox({
  images,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  'aria-label': ariaLabel = 'Image viewer',
  thumbnails = false,
  loop = false,
  maxZoom = 4,
  returnFocus,
  labels: labelsProp,
  appearance = 'dark',
  animation = 'fade',
  className,
  ...rest
}: LightboxProps) {
  const labels = { ...defaultLabels, ...labelsProp };
  const base = `os-lightbox-${useId().replace(/:/g, '')}`;
  const counterId = `${base}-counter`;
  const captionId = `${base}-caption`;
  const { announce } = useAnnouncer();

  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [rawIndex, setIndex] = useControllableState(indexProp, defaultIndex, onIndexChange);
  const count = images.length;
  const index = clamp(rawIndex, 0, Math.max(0, count - 1));
  const image = images[index];
  const shown = open && count > 0;
  // Keep the content through the exit animation, and render nothing (no image requests) while closed.
  const { mounted } = useTransition(shown, { duration: EXIT_MS });

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const figureRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  // The <dialog> is Dialog's own element: find it from inside, for the scoped hotkeys.
  const contentRef = useCallback((node: HTMLDivElement | null) => {
    dialogRef.current = node?.closest('dialog') ?? null;
  }, []);

  const [zoom, setZoom] = useState<Zoom>(NO_ZOOM);
  const [gesturing, setGesturing] = useState(false);
  const [status, setStatus] = useState<Record<string, 'loaded' | 'error'>>({});
  const imageStatus = image ? (status[image.src] ?? 'loading') : 'loading';
  // Thumbnails that failed to load show an icon instead of the browser's broken-image glyph.
  const [brokenThumbs, setBrokenThumbs] = useState<Record<string, boolean>>({});
  const zoomed = zoom.scale > 1;
  // The latest zoom for event handlers, so quick key repeats and pointer moves never read a stale render.
  const zoomRef = useRef(zoom);
  useIsomorphicLayoutEffect(() => {
    zoomRef.current = zoom;
  });
  const applyZoom = (z: Zoom) => {
    zoomRef.current = z;
    setZoom(z);
  };

  // A new image, or reopening, starts unzoomed.
  const [prevKey, setPrevKey] = useState(`${index}:${shown}`);
  if (prevKey !== `${index}:${shown}`) {
    setPrevKey(`${index}:${shown}`);
    setZoom(NO_ZOOM);
    setGesturing(false);
  }

  useEffect(() => {
    if (shown) warnEmptyAlt(images);
  }, [shown, images]);

  // ---------- Navigation ----------
  const canPrev = count > 1 && (loop || index > 0);
  const canNext = count > 1 && (loop || index < count - 1);
  const go = (i: number) => {
    if (!count) return;
    const n = loop ? (i + count) % count : clamp(i, 0, count - 1);
    if (n !== index) setIndex(n);
  };
  const next = () => canNext && go(index + 1);
  const prev = () => canPrev && go(index - 1);
  const close = () => setOpen(false);

  // ---------- Announce the position on change ----------
  const announced = useRef<number | null>(null);
  useEffect(() => {
    if (!shown) {
      announced.current = null;
      return;
    }
    // On open the dialog is described by the counter; after that, each change is announced.
    if (announced.current !== null && announced.current !== index) announce(labels.counter(index + 1, count));
    announced.current = index;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- announce when the position changes
  }, [shown, index, count]);

  // ---------- Preload the neighbors ----------
  useEffect(() => {
    if (!shown || count < 2 || typeof Image === 'undefined') return;
    const near = new Set([index - 1, index + 1].map((i) => (loop ? (i + count) % count : i)).filter((i) => i >= 0 && i < count && i !== index));
    for (const i of near) {
      const img = images[i]!;
      const pre = new Image();
      if (img.sizes) pre.sizes = img.sizes;
      if (img.srcSet) pre.srcset = img.srcSet;
      pre.src = img.src;
    }
  }, [shown, index, count, loop, images]);

  // An image served from cache can finish before React listens (after hydration, say).
  useIsomorphicLayoutEffect(() => {
    const img = imgRef.current;
    if (!img || !image || !img.complete || status[image.src]) return;
    if (img.naturalWidth > 0) setStatus((s) => ({ ...s, [image.src]: 'loaded' }));
  }, [image, status]);

  // Keep the current thumbnail in view.
  useEffect(() => {
    if (!mounted || !thumbnails) return;
    thumbsRef.current?.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [mounted, thumbnails, index]);

  // ---------- Zoom ----------
  /** Keeps the zoomed image covering the stage: no panning past its edges. */
  const fit = (z: Zoom): Zoom => {
    const stage = stageRef.current;
    const img = imgRef.current;
    if (z.scale <= 1 || !stage || !img) return NO_ZOOM;
    const mx = Math.max(0, (img.offsetWidth * z.scale - stage.clientWidth) / 2);
    const my = Math.max(0, (img.offsetHeight * z.scale - stage.clientHeight) / 2);
    return { scale: z.scale, x: clamp(z.x, -mx, mx), y: clamp(z.y, -my, my) };
  };

  /** Zooms to `scale`, keeping the point under `origin` (client coordinates) in place; else the view center. */
  const zoomAround = (from: Zoom, scale: number, origin?: { x: number; y: number }, center?: { x: number; y: number }): Zoom => {
    const s = clamp(scale, 1, maxZoom);
    if (s === 1) return NO_ZOOM;
    if (!origin || !center) return fit({ scale: s, x: (from.x * s) / from.scale, y: (from.y * s) / from.scale });
    // `center` is the unzoomed image center; the image point under `origin` stays under it.
    const ux = (origin.x - center.x - from.x) / from.scale;
    const uy = (origin.y - center.y - from.y) / from.scale;
    return fit({ scale: s, x: origin.x - center.x - ux * s, y: origin.y - center.y - uy * s });
  };

  /** Where the image's center is without the current pan. */
  const imageCenter = (z: Zoom) => {
    const r = imgRef.current?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2 - z.x, y: r.top + r.height / 2 - z.y } : { x: 0, y: 0 };
  };

  const zoomBy = (to: number, origin?: { x: number; y: number }) => {
    if (imageStatus !== 'loaded') return;
    const cur = zoomRef.current;
    const next = zoomAround(cur, to, origin, origin ? imageCenter(cur) : undefined);
    if (next.scale === cur.scale && !origin) return;
    applyZoom(next);
    announce(labels.zoom(Math.round(next.scale * 100)));
  };
  const zoomIn = () => zoomBy(zoomRef.current.scale + ZOOM_STEP);
  const zoomOut = () => zoomBy(zoomRef.current.scale - ZOOM_STEP);
  const resetZoom = () => {
    if (zoomRef.current.scale <= 1) return;
    applyZoom(NO_ZOOM);
    announce(labels.zoom(100));
  };
  const pan = (dx: number, dy: number) => {
    const z = zoomRef.current;
    applyZoom(fit({ ...z, x: z.x + dx, y: z.y + dy }));
  };

  // ---------- Keyboard (scoped to the dialog) ----------
  useHotkeys(
    ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Plus', '=', '-', '0', 'Escape'],
    (e) => {
      const key = e.key;
      let handled = true;
      if (key === 'Escape') close();
      else if (key === '+' || key === '=') zoomIn();
      else if (key === '-') zoomOut();
      else if (key === '0') resetZoom();
      else if (key === 'Home') go(0);
      else if (key === 'End') go(count - 1);
      else if (zoomRef.current.scale > 1) {
        // Zoomed in, the arrows pan (physically: Left shows what is to the left).
        if (key === 'ArrowLeft') pan(PAN_STEP, 0);
        else if (key === 'ArrowRight') pan(-PAN_STEP, 0);
        else if (key === 'ArrowUp') pan(0, PAN_STEP);
        else pan(0, -PAN_STEP);
      } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
        const rtl = isRtl(e.currentTarget as Element);
        if ((key === 'ArrowRight') !== rtl) next();
        else prev();
      } else handled = false;
      if (handled) e.preventDefault();
    },
    { enabled: shown, target: dialogRef, preventDefault: false },
  );

  // ---------- Touch and pointer ----------
  // On the whole figure, so a swipe that starts on the previous/next buttons or the caption counts too.
  useSwipe(figureRef, {
    enabled: shown && !zoomed && count > 1,
    onSwipe: (dir) => {
      if (dir === 'start') next();
      else if (dir === 'end') prev();
    },
  });

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<
    | { kind: 'pan'; x: number; y: number; from: Zoom }
    | { kind: 'pinch'; dist: number; mid: { x: number; y: number }; center: { x: number; y: number }; from: Zoom }
    | null
  >(null);
  const press = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTap = useRef<{ x: number; y: number; time: number } | null>(null);

  const two = () => {
    const [a, b] = Array.from(pointers.current.values()) as [{ x: number; y: number }, { x: number; y: number }];
    return { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
  };
  const startPan = (p: { x: number; y: number }, from: Zoom) => {
    gesture.current = { kind: 'pan', x: p.x, y: p.y, from };
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (imageStatus !== 'loaded' || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      press.current = { x: e.clientX, y: e.clientY, time: e.timeStamp };
      if (zoomRef.current.scale > 1) startPan({ x: e.clientX, y: e.clientY }, zoomRef.current);
    } else if (pointers.current.size === 2) {
      press.current = null;
      lastTap.current = null;
      const { dist, mid } = two();
      const from = zoomRef.current;
      gesture.current = { kind: 'pinch', dist, mid, center: imageCenter(from), from };
    }
    if (gesture.current) setGesturing(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    if (g.kind === 'pinch' && pointers.current.size >= 2) {
      const { dist, mid } = two();
      // Scale by the finger spread, keeping the point that was under the fingers under them.
      const s = clamp(g.from.scale * (dist / g.dist), 1, maxZoom);
      const ux = (g.mid.x - g.center.x - g.from.x) / g.from.scale;
      const uy = (g.mid.y - g.center.y - g.from.y) / g.from.scale;
      applyZoom(fit({ scale: s, x: mid.x - g.center.x - ux * s, y: mid.y - g.center.y - uy * s }));
    } else if (g.kind === 'pan') {
      applyZoom(fit({ ...g.from, x: g.from.x + e.clientX - g.x, y: g.from.y + e.clientY - g.y }));
    }
  };

  const endPointer = (e: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) => {
    if (!pointers.current.delete(e.pointerId)) return;
    const left = pointers.current.size;
    if (gesture.current?.kind === 'pinch' && left === 1) {
      // One finger stays down: keep panning from where it is.
      const [p] = Array.from(pointers.current.values()) as [{ x: number; y: number }];
      if (zoomRef.current.scale > 1) startPan(p, zoomRef.current);
      else gesture.current = null;
    }
    if (left > 0) return;
    gesture.current = null;
    setGesturing(false);
    const p = press.current;
    press.current = null;
    if (cancelled || !p) return;
    // A tap: short and still. Two taps close together toggle 2× zoom at that point.
    const still = Math.hypot(e.clientX - p.x, e.clientY - p.y) < TAP_SLOP;
    if (!still || e.timeStamp - p.time > DOUBLE_TAP_MS) {
      lastTap.current = null;
      return;
    }
    const t = lastTap.current;
    if (t && e.timeStamp - t.time < DOUBLE_TAP_MS && Math.hypot(e.clientX - t.x, e.clientY - t.y) < TAP_SLOP * 3) {
      lastTap.current = null;
      if (zoomRef.current.scale > 1) resetZoom();
      else zoomBy(2, { x: e.clientX, y: e.clientY });
    } else lastTap.current = { x: e.clientX, y: e.clientY, time: e.timeStamp };
  };

  useEffect(() => {
    if (shown) return;
    pointers.current.clear();
    gesture.current = null;
  }, [shown]);

  // ---------- Render ----------
  const download = image?.download ? (typeof image.download === 'string' ? image.download : image.src) : undefined;
  const transform = zoomed ? `translate3d(${zoom.x}px, ${zoom.y}px, 0) scale(${zoom.scale})` : undefined;

  return (
    <Dialog
      open={shown}
      onClose={close}
      title={null}
      aria-label={ariaLabel}
      aria-describedby={mounted ? counterId : undefined}
      hideCloseButton
      fullscreen
      appearance={appearance}
      animation={animation}
      returnFocus={returnFocus}
      className={cx(cls('lightbox'), className)}
      {...rest}
    >
      {mounted && image && (
        <div ref={contentRef} className={cls('lightbox__content')} data-zoomed={zoomed || undefined}>
          <div className={cls('lightbox__toolbar')}>
            <p id={counterId} className={cls('lightbox__counter')}>
              {labels.counter(index + 1, count)}
            </p>
            <div className={cls('lightbox__actions')}>
              <Button
                variant="ghost"
                color="neutral"
                iconOnly
                aria-label={labels.zoomOut}
                aria-disabled={!zoomed || imageStatus !== 'loaded' || undefined}
                onClick={zoomOut}
              >
                <ZoomOutIcon />
              </Button>
              <Button
                variant="ghost"
                color="neutral"
                iconOnly
                aria-label={labels.zoomIn}
                aria-disabled={zoom.scale >= maxZoom || imageStatus !== 'loaded' || undefined}
                onClick={zoomIn}
              >
                <ZoomInIcon />
              </Button>
              {download && (
                <Button variant="ghost" color="neutral" iconOnly href={download} download aria-label={labels.download}>
                  <DownloadIcon />
                </Button>
              )}
              <CloseButton label={labels.close} onClick={close} className={cls('lightbox__close')} />
            </div>
          </div>
          <figure ref={figureRef} className={cls('lightbox__figure')}>
            <div
              ref={stageRef}
              className={cls('lightbox__stage')}
              data-status={imageStatus}
              data-gesture={gesturing || undefined}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={(e) => endPointer(e, false)}
              onPointerCancel={(e) => endPointer(e, true)}
            >
              {imageStatus !== 'error' && (
                <img
                  key={image.src}
                  ref={imgRef}
                  className={cls('lightbox__image')}
                  src={image.src}
                  srcSet={image.srcSet}
                  sizes={image.sizes}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  aria-describedby={image.caption ? captionId : undefined}
                  decoding="async"
                  draggable={false}
                  style={{ transform } as CSSProperties}
                  onLoad={() => setStatus((s) => ({ ...s, [image.src]: 'loaded' }))}
                  onError={() => setStatus((s) => ({ ...s, [image.src]: 'error' }))}
                />
              )}
              {imageStatus === 'loading' && <Spinner size="lg" color="current" label={labels.loading} className={cls('lightbox__spinner')} />}
              {imageStatus === 'error' && (
                <div className={cls('lightbox__error')}>
                  <ImageOffIcon size="lg" />
                  <p className={cls('lightbox__error-title')}>{labels.error}</p>
                  {image.alt && <p className={cls('lightbox__error-alt')}>{image.alt}</p>}
                </div>
              )}
            </div>
            {count > 1 && (
              <>
                <Button
                  variant="outline"
                  color="neutral"
                  shape="pill"
                  iconOnly
                  className={cls('lightbox__nav')}
                  data-dir="prev"
                  aria-label={labels.previous}
                  aria-disabled={!canPrev || undefined}
                  onClick={prev}
                >
                  <ChevronLeftIcon data-dir="prev" />
                </Button>
                <Button
                  variant="outline"
                  color="neutral"
                  shape="pill"
                  iconOnly
                  className={cls('lightbox__nav')}
                  data-dir="next"
                  aria-label={labels.next}
                  aria-disabled={!canNext || undefined}
                  onClick={next}
                >
                  <ChevronRightIcon data-dir="next" />
                </Button>
              </>
            )}
            {image.caption && (
              <figcaption id={captionId} className={cls('lightbox__caption')}>
                {image.caption}
              </figcaption>
            )}
          </figure>
          {thumbnails && count > 1 && (
            <div ref={thumbsRef} role="group" aria-label={labels.thumbnails} className={cls('lightbox__thumbnails')}>
              {images.map((img, i) => (
                <button
                  key={`${i}:${img.src}`}
                  type="button"
                  className={cls('lightbox__thumb')}
                  aria-label={labels.thumbnail(i + 1, count, img.alt)}
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => go(i)}
                >
                  {brokenThumbs[img.thumbnail ?? img.src] ? (
                    <ImageOffIcon />
                  ) : (
                    <img
                      src={img.thumbnail ?? img.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      onError={() => setBrokenThumbs((b) => ({ ...b, [img.thumbnail ?? img.src]: true }))}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}

export interface LightboxGalleryProps extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  images: LightboxImage[];
  /** Smallest thumbnail width; the grid fits as many columns as it can. Default `'10rem'`. */
  minItemSize?: string;
  /** Space between thumbnails. Default `'0.5rem'`. */
  gap?: string;
  /** Thumbnail shape, as a CSS `aspect-ratio`. Default `'1'` (square crops). */
  aspectRatio?: string;
  /** Name of each thumbnail button. Default "Open <alt>". */
  openLabel?: (image: LightboxImage, index: number) => string;
  /** The open image, controlled. */
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Passed to the Lightbox (`thumbnails`, `loop`, `labels`, `aria-label`…). */
  lightboxProps?: Omit<LightboxProps, 'images' | 'open' | 'defaultOpen' | 'onOpenChange' | 'index' | 'defaultIndex' | 'onIndexChange' | 'returnFocus'>;
}

/**
 * A responsive grid of thumbnail buttons wired to a Lightbox. Each button is named
 * "Open <alt>"; closing the viewer returns focus to the thumbnail that opened it.
 */
export const LightboxGallery = forwardRef<HTMLUListElement, LightboxGalleryProps>(function LightboxGallery(
  {
    images,
    minItemSize = '10rem',
    gap = '0.5rem',
    aspectRatio = '1',
    openLabel = (img) => `Open ${img.alt}`,
    index: indexProp,
    defaultIndex = 0,
    onIndexChange,
    open: openProp,
    onOpenChange,
    lightboxProps,
    className,
    style,
    ...rest
  },
  ref,
) {
  const [open, setOpen] = useControllableState(openProp, false, onOpenChange);
  const [index, setIndex] = useControllableState(indexProp, defaultIndex, onIndexChange);
  const opener = useRef<HTMLButtonElement | null>(null);
  const [broken, setBroken] = useState<Record<number, boolean>>({});
  const vars = { '--_min': minItemSize, '--_gap': gap, '--_ratio': aspectRatio } as CSSProperties;

  return (
    <>
      <ul ref={ref} className={cx(cls('lightbox-gallery'), className)} style={{ ...vars, ...style }} {...rest}>
        {images.map((img, i) => (
          <li key={`${i}:${img.src}`} className={cls('lightbox-gallery__item')}>
            <button
              type="button"
              className={cls('lightbox-gallery__button')}
              aria-label={openLabel(img, i)}
              aria-haspopup="dialog"
              onClick={(e) => {
                opener.current = e.currentTarget;
                setIndex(i);
                setOpen(true);
              }}
            >
              {broken[i] ? (
                <ImageOffIcon size="lg" />
              ) : (
                <img
                  src={img.thumbnail ?? img.src}
                  alt=""
                  width={img.width}
                  height={img.height}
                  loading="lazy"
                  decoding="async"
                  onError={() => setBroken((b) => ({ ...b, [i]: true }))}
                />
              )}
            </button>
          </li>
        ))}
      </ul>
      <Lightbox
        {...lightboxProps}
        images={images}
        open={open}
        onOpenChange={setOpen}
        index={index}
        onIndexChange={setIndex}
        returnFocus={opener}
      />
    </>
  );
});
