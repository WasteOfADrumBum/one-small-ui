import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { usePrefersReducedMotion } from '../hooks/useMediaQuery';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export type CarouselEnd = 'loop' | 'rewind' | 'stop';

export interface CarouselProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Names the carousel, e.g. "Featured destinations". */
  'aria-label': string;
  /** `slide` scrolls a native scroll-snap track (touch-swipeable); `fade` crossfades in place. */
  transition?: 'slide' | 'fade';
  /** Previous/next (and play/pause) placement, or `false` to hide them. */
  controls?: 'overlay' | 'top' | 'bottom' | false;
  /** Show a button per slide. */
  indicators?: boolean;
  /** Slides visible at once; `'auto'` lets each slide set its own width. Slide transition only. */
  itemsPerView?: number | 'auto';
  /** Show part of the neighboring slides, e.g. `'12%'` or `'3rem'` (`true` = `'10%'`). */
  peek?: boolean | string;
  /** Space between slides. */
  gap?: string;
  /** What happens past the last slide: `loop` jumps around, `rewind` scrolls back, `stop` disables the button. */
  end?: CarouselEnd;
  /**
   * Opt-in auto-rotation, in ms (`true` = 5000). Always paired with a visible
   * pause/play button, and pauses on hover and focus (WCAG 2.2.2).
   * Off by default, and does not start for people who prefer reduced motion.
   */
  autoplay?: boolean | number;
  appearance?: 'default' | 'dark';
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  labels?: Partial<{ previous: string; next: string; play: string; pause: string; goTo: (n: number) => string; slide: (n: number, total: number) => string }>;
  children: ReactNode;
}

interface SlideContextValue {
  index: number;
  count: number;
  active: boolean;
  label: string;
}
const SlideContext = createContext<SlideContextValue | null>(null);

export interface CarouselSlideProps extends HTMLAttributes<HTMLDivElement> {
  /** Time on this slide while auto-rotating, in ms. */
  interval?: number;
  /** Accessible label; default "n of total". */
  label?: string;
}

/** One slide: an image, or any content. */
export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(function CarouselSlide(
  { interval: _interval, label, className, children, ...rest },
  ref,
) {
  void _interval;
  const ctx = useContext(SlideContext);
  if (!ctx) throw new Error('<CarouselSlide> must be inside <Carousel>.');
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      aria-label={label ?? ctx.label}
      className={cx(cls('carousel__slide'), className)}
      data-active={ctx.active || undefined}
      data-index={ctx.index}
      {...rest}
    >
      {children}
    </div>
  );
});

/** Content over the bottom of a slide (title and text over an image). */
export function CarouselCaption({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(cls('carousel__caption'), className)} {...rest} />;
}

const Chevron = ({ dir }: { dir: 'prev' | 'next' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" data-dir={dir}>
    <path d={dir === 'prev' ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'} />
  </svg>
);

const isRtl = (el: Element | null) => !!el && getComputedStyle(el).direction === 'rtl';

/**
 * A carousel following the WAI-ARIA APG carousel pattern. The slide transition
 * is a CSS scroll-snap track, so touch, trackpad and keyboard scrolling are native.
 */
export const Carousel = forwardRef<HTMLElement, CarouselProps>(function Carousel(
  {
    transition = 'slide',
    controls = 'overlay',
    indicators = true,
    itemsPerView = 1,
    peek,
    gap = '1rem',
    end = 'rewind',
    autoplay = false,
    appearance = 'default',
    index,
    defaultIndex = 0,
    onIndexChange,
    labels = {},
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const slides = Children.toArray(children).filter(isValidElement) as ReactElement<CarouselSlideProps>[];
  const count = slides.length;
  const fade = transition === 'fade';
  const perView = fade ? 1 : itemsPerView;
  const positions = perView === 'auto' ? count : Math.max(1, count - perView + 1);
  const [current, setCurrent] = useControllableState(index, defaultIndex, onIndexChange);
  const reduced = usePrefersReducedMotion();
  const autoMs = autoplay === true ? 5000 : autoplay || 0;
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: count <= 1 });
  const trackRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  // True while an index change came from inside (buttons, scrolling), so the track isn't moved twice.
  const internal = useRef(false);
  const id = `os-carousel-${useId().replace(/:/g, '')}`;
  const L = {
    previous: 'Previous slide',
    next: 'Next slide',
    play: 'Start automatic slide show',
    pause: 'Stop automatic slide show',
    goTo: (n: number) => `Go to slide ${n}`,
    slide: (n: number, total: number) => `${n} of ${total}`,
    ...labels,
  };

  // Start rotating only when asked, and not for reduced-motion users.
  useEffect(() => {
    setPlaying(autoMs > 0 && !reduced);
  }, [autoMs, reduced]);

  const slideEls = () => Array.from(trackRef.current?.children ?? []) as HTMLElement[];

  const scrollToIndex = useCallback(
    (i: number, behavior: ScrollBehavior) => {
      const track = trackRef.current;
      const el = slideEls()[i];
      if (!track || !el) return;
      const t = track.getBoundingClientRect();
      const s = el.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0;
      const delta = isRtl(track) ? s.right - t.right + pad : s.left - t.left - pad;
      track.scrollTo?.({ left: track.scrollLeft + delta, behavior });
    },
    [],
  );

  const go = useCallback(
    (target: number, opts: { wrap?: 'loop' | 'rewind' } = {}) => {
      const max = positions - 1;
      const i = Math.min(Math.max(target, 0), max);
      internal.current = true;
      setCurrent(i);
      if (fade) return;
      const smooth: ScrollBehavior = reduced ? 'auto' : 'smooth';
      const track = trackRef.current;
      if (opts.wrap === 'loop' && track && typeof track.animate === 'function' && !reduced) {
        // Loop: fade the track out, jump, fade back in (no visible rewind).
        track.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }], { duration: 360, easing: 'ease-in-out' });
        setTimeout(() => scrollToIndex(i, 'auto'), 180);
      } else {
        scrollToIndex(i, smooth);
      }
    },
    [positions, setCurrent, fade, reduced, scrollToIndex],
  );

  const atEnd = fade ? current >= count - 1 : edges.end;
  const atStart = fade ? current <= 0 : edges.start;
  const next = useCallback(() => {
    if (!atEnd) go(current + 1);
    else if (end !== 'stop') go(0, { wrap: end });
  }, [atEnd, go, current, end]);
  const prev = () => {
    if (!atStart) go(current - 1);
    else if (end !== 'stop') go(positions - 1, { wrap: end });
  };

  // Track the slide nearest the start edge while scrolling (swipe, wheel, keyboard).
  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track) return;
      const rtl = isRtl(track);
      const t = track.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0;
      let best = 0;
      let bestD = Infinity;
      slideEls().forEach((el, i) => {
        const s = el.getBoundingClientRect();
        const d = Math.abs(rtl ? t.right - pad - s.right : s.left - t.left - pad);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      const scrolled = Math.abs(track.scrollLeft);
      const max = track.scrollWidth - track.clientWidth;
      const isEnd = scrolled >= max - 2;
      setEdges({ start: scrolled <= 2, end: isEnd });
      const i = isEnd ? positions - 1 : Math.min(best, positions - 1);
      if (i !== current) {
        internal.current = true;
        setCurrent(i);
      }
    });
  };
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // Keep edges right when sizes change.
  useEffect(() => {
    if (fade) return;
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => onScroll());
    ro.observe(track);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fade, count]);

  // Controlled index changes from outside move the track.
  const lastIndex = useRef(current);
  useEffect(() => {
    if (lastIndex.current !== current && !fade && !internal.current) scrollToIndex(current, reduced ? 'auto' : 'smooth');
    internal.current = false;
    lastIndex.current = current;
  }, [current, fade, reduced, scrollToIndex]);

  // Auto-rotation, paused on hover and while focus is inside.
  const interval = slides[current]?.props.interval ?? autoMs;
  useEffect(() => {
    if (!playing || hovered || focused || !interval) return;
    const t = setTimeout(() => {
      if (atEnd && end === 'stop') setPlaying(false);
      else next();
    }, interval);
    return () => clearTimeout(t);
  }, [playing, hovered, focused, interval, next, atEnd, end]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = isRtl(e.currentTarget);
    if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) {
      e.preventDefault();
      next();
    } else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) {
      e.preventDefault();
      prev();
    } else if (e.key === 'Home') {
      e.preventDefault();
      go(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      go(positions - 1);
    }
  };

  // Simple swipe for the fade transition (the slide track scrolls natively).
  const swipe = useRef<number | null>(null);

  const peekValue = peek === true ? '10%' : peek || undefined;
  const vars = {
    '--_gap': gap,
    '--_per-view': perView === 'auto' ? undefined : perView,
    '--_peek': peekValue,
  } as CSSProperties;

  const rotation = autoMs > 0 && (
    <button
      type="button"
      className={cx(cls('carousel__btn'), cls('carousel__play'))}
      aria-label={playing ? L.pause : L.play}
      onClick={() => setPlaying((p) => !p)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l11-6.5z" />}
      </svg>
    </button>
  );
  const prevBtn = controls && (
    <button
      type="button"
      className={cx(cls('carousel__btn'), cls('carousel__prev'))}
      aria-label={L.previous}
      aria-controls={`${id}-track`}
      disabled={end === 'stop' && atStart}
      onClick={prev}
    >
      <Chevron dir="prev" />
    </button>
  );
  const nextBtn = controls && (
    <button
      type="button"
      className={cx(cls('carousel__btn'), cls('carousel__next'))}
      aria-label={L.next}
      aria-controls={`${id}-track`}
      disabled={end === 'stop' && atEnd}
      onClick={next}
    >
      <Chevron dir="next" />
    </button>
  );
  const dots = indicators && positions > 1 && (
    <div className={cls('carousel__indicators')} role="group" aria-label="Choose slide">
      {Array.from({ length: positions }, (_, i) => (
        <button
          key={i}
          type="button"
          className={cls('carousel__dot')}
          aria-label={L.goTo(i + 1)}
          aria-current={i === current ? 'true' : undefined}
          aria-controls={`${id}-track`}
          onClick={() => go(i)}
        />
      ))}
    </div>
  );
  const bar = controls === 'top' || controls === 'bottom';

  return (
    <section
      ref={ref}
      className={cx(cls('carousel'), className)}
      aria-roledescription="carousel"
      data-transition={transition}
      data-controls={controls || 'none'}
      data-per-view={perView === 'auto' ? 'auto' : undefined}
      data-peek={peekValue ? '' : undefined}
      data-os-theme={appearance === 'dark' ? 'dark' : undefined}
      style={{ ...vars, ...style }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!(e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget))) setFocused(false);
      }}
      {...rest}
    >
      {bar && controls === 'top' && (
        <div className={cls('carousel__bar')}>
          {rotation}
          {prevBtn}
          {dots}
          {nextBtn}
        </div>
      )}
      {!bar && rotation}
      <div className={cls('carousel__viewport')}>
        <div
          ref={trackRef}
          id={`${id}-track`}
          className={cls('carousel__track')}
          aria-live={playing && !hovered && !focused ? 'off' : 'polite'}
          tabIndex={fade ? undefined : 0}
          onScroll={fade ? undefined : onScroll}
          onKeyDown={onKeyDown}
          onPointerDown={fade ? (e) => (swipe.current = e.clientX) : undefined}
          onPointerUp={
            fade
              ? (e) => {
                  if (swipe.current === null) return;
                  const dx = (e.clientX - swipe.current) * (isRtl(e.currentTarget) ? -1 : 1);
                  swipe.current = null;
                  if (dx < -40) next();
                  else if (dx > 40) prev();
                }
              : undefined
          }
        >
          {slides.map((slide, i) => (
            <SlideContext.Provider
              key={slide.key ?? i}
              value={{
                index: i,
                count,
                active: perView === 'auto' || perView === 1 ? i === current : i >= current && i < current + perView,
                label: L.slide(i + 1, count),
              }}
            >
              {slide}
            </SlideContext.Provider>
          ))}
        </div>
        {controls === 'overlay' && (
          <>
            {prevBtn}
            {nextBtn}
          </>
        )}
        {controls === 'overlay' && dots}
      </div>
      {controls === false && dots}
      {controls === 'bottom' && (
        <div className={cls('carousel__bar')}>
          {rotation}
          {prevBtn}
          {dots}
          {nextBtn}
        </div>
      )}
    </section>
  );
});
