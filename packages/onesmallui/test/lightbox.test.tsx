import { useRef, useState } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Carousel, CarouselSlide } from '../src/components/Carousel';
import { Lightbox, LightboxGallery, type LightboxImage, type LightboxProps } from '../src/components/Lightbox';
import { AnnouncerProvider } from '../src/hooks/useAnnouncer';
import { useSwipe, type SwipeDirection, type UseSwipeOptions } from '../src/hooks/useSwipe';

// jsdom has no PointerEvent; React and useSwipe read pointerType, pointerId and isPrimary from it.
beforeAll(() => {
  if (typeof window.PointerEvent === 'undefined') {
    class PointerEventPolyfill extends MouseEvent {
      pointerId: number;
      pointerType: string;
      isPrimary: boolean;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 1;
        this.pointerType = init.pointerType ?? 'mouse';
        this.isPrimary = init.isPrimary ?? true;
      }
    }
    window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
  }
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function expectNoAxeViolations(container: HTMLElement) {
  const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
  expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

type Pointer = { x: number; y?: number; id?: number; type?: string; primary?: boolean; button?: number };
const pointer = (type: 'pointerDown' | 'pointerMove' | 'pointerUp' | 'pointerCancel', el: Element, p: Pointer) =>
  fireEvent[type](el, {
    clientX: p.x,
    clientY: p.y ?? 100,
    pointerId: p.id ?? 1,
    pointerType: p.type ?? 'touch',
    isPrimary: p.primary ?? (p.id ?? 1) === 1,
    button: p.button ?? 0,
  });
const drag = (el: Element, from: Pointer, to: Pointer) => {
  pointer('pointerDown', el, from);
  pointer('pointerUp', el, { ...from, ...to });
};

// ---------- useSwipe ----------

function SwipeArea(props: Omit<UseSwipeOptions, 'onSwipe'> & { onSwipe: (d: SwipeDirection) => void; dir?: 'ltr' | 'rtl' }) {
  const { dir = 'ltr', onSwipe, ...options } = props;
  const ref = useRef<HTMLDivElement>(null);
  useSwipe(ref, { ...options, onSwipe: (d) => onSwipe(d) });
  return (
    <div dir={dir}>
      <div ref={ref} data-testid="area" />
    </div>
  );
}

describe('useSwipe', () => {
  const area = () => screen.getByTestId('area');

  it('reports horizontal swipes in logical directions past the threshold', () => {
    const onSwipe = vi.fn();
    render(<SwipeArea onSwipe={onSwipe} />);
    drag(area(), { x: 200 }, { x: 150 });
    expect(onSwipe).toHaveBeenLastCalledWith('start');
    drag(area(), { x: 100 }, { x: 160 });
    expect(onSwipe).toHaveBeenLastCalledWith('end');
    // Exactly the threshold (40px) is not a swipe.
    drag(area(), { x: 100 }, { x: 60 });
    expect(onSwipe).toHaveBeenCalledTimes(2);
  });

  it('flips start and end in RTL', () => {
    const onSwipe = vi.fn();
    render(<SwipeArea onSwipe={onSwipe} dir="rtl" />);
    drag(area(), { x: 200 }, { x: 100 });
    expect(onSwipe).toHaveBeenLastCalledWith('end');
    drag(area(), { x: 100 }, { x: 200 });
    expect(onSwipe).toHaveBeenLastCalledWith('start');
  });

  it('honors threshold, axis and enabled', () => {
    const onSwipe = vi.fn();
    const { rerender } = render(<SwipeArea onSwipe={onSwipe} threshold={100} />);
    drag(area(), { x: 200 }, { x: 120 });
    expect(onSwipe).not.toHaveBeenCalled();
    rerender(<SwipeArea onSwipe={onSwipe} axis="y" />);
    drag(area(), { x: 100, y: 100 }, { x: 300, y: 40 });
    expect(onSwipe).toHaveBeenLastCalledWith('up');
    drag(area(), { x: 100, y: 100 }, { x: 100, y: 200 });
    expect(onSwipe).toHaveBeenLastCalledWith('down');
    rerender(<SwipeArea onSwipe={onSwipe} axis="both" />);
    drag(area(), { x: 100, y: 100 }, { x: 300, y: 40 });
    expect(onSwipe).toHaveBeenLastCalledWith('end');
    drag(area(), { x: 100, y: 100 }, { x: 120, y: 200 });
    expect(onSwipe).toHaveBeenLastCalledWith('down');
    onSwipe.mockClear();
    rerender(<SwipeArea onSwipe={onSwipe} enabled={false} />);
    drag(area(), { x: 300 }, { x: 0 });
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('ignores mouse drags unless mouse is set, and only the primary button', () => {
    const onSwipe = vi.fn();
    const { rerender } = render(<SwipeArea onSwipe={onSwipe} />);
    drag(area(), { x: 200, type: 'mouse' }, { x: 0 });
    expect(onSwipe).not.toHaveBeenCalled();
    rerender(<SwipeArea onSwipe={onSwipe} mouse />);
    drag(area(), { x: 200, type: 'mouse', button: 2 }, { x: 0 });
    expect(onSwipe).not.toHaveBeenCalled();
    drag(area(), { x: 200, type: 'mouse' }, { x: 0 });
    expect(onSwipe).toHaveBeenCalledWith('start');
  });

  it('ignores multi-touch gestures and cancelled pointers', () => {
    const onSwipe = vi.fn();
    render(<SwipeArea onSwipe={onSwipe} />);
    pointer('pointerDown', area(), { x: 200, id: 1 });
    pointer('pointerDown', area(), { x: 300, id: 2 });
    pointer('pointerUp', area(), { x: 50, id: 1 });
    pointer('pointerUp', area(), { x: 100, id: 2 });
    expect(onSwipe).not.toHaveBeenCalled();
    pointer('pointerDown', area(), { x: 200 });
    pointer('pointerCancel', area(), { x: 200 });
    pointer('pointerUp', area(), { x: 0 });
    expect(onSwipe).not.toHaveBeenCalled();
    // A new primary pointer starts fresh even if an earlier release was never seen.
    pointer('pointerDown', area(), { x: 200, id: 5, primary: false });
    drag(area(), { x: 200, id: 6, primary: true }, { x: 50 });
    expect(onSwipe).toHaveBeenCalledWith('start');
  });
});

describe('Carousel fade swipe (useSwipe)', () => {
  function setup(dir: 'ltr' | 'rtl' = 'ltr') {
    const onIndexChange = vi.fn();
    const { container } = render(
      <div dir={dir}>
        <Carousel aria-label="Pics" transition="fade" defaultIndex={1} onIndexChange={onIndexChange}>
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
          <CarouselSlide>Three</CarouselSlide>
        </Carousel>
      </div>,
    );
    return { onIndexChange, track: container.querySelector('.os-carousel__track')! };
  }

  it('swipes with touch and mouse, past 40px', () => {
    const { onIndexChange, track } = setup();
    drag(track, { x: 200, type: 'mouse' }, { x: 150 });
    expect(onIndexChange).toHaveBeenLastCalledWith(2);
    drag(track, { x: 100, type: 'mouse' }, { x: 160 });
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
    onIndexChange.mockClear();
    drag(track, { x: 100 }, { x: 60 });
    expect(onIndexChange).not.toHaveBeenCalled();
    drag(track, { x: 100 }, { x: 50 });
    expect(onIndexChange).toHaveBeenLastCalledWith(2);
  });

  it('mirrors in RTL', () => {
    const { onIndexChange, track } = setup('rtl');
    drag(track, { x: 200 }, { x: 150 });
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
  });
});

// ---------- Lightbox ----------

const images: LightboxImage[] = [
  { src: '/a.jpg', alt: 'Harbor at dawn', caption: 'Fishing boats leave at first light.', thumbnail: '/a-thumb.jpg', width: 1200, height: 800 },
  { src: '/b.jpg', alt: 'Dunes', srcSet: '/b-640.jpg 640w, /b-1280.jpg 1280w', sizes: '100vw', download: true },
  { src: '/c.jpg', alt: 'Glacier', download: '/c-original.tif' },
  { src: '/d.jpg', alt: 'City at night' },
];

const dialog = () => document.querySelector('dialog.os-lightbox') as HTMLDialogElement;
const img = () => dialog().querySelector('img.os-lightbox__image') as HTMLImageElement;
const stage = () => dialog().querySelector('.os-lightbox__stage') as HTMLElement;
const counter = () => dialog().querySelector('.os-lightbox__counter')!.textContent;
// The provider's own region (rendered in the container), not the shared fallback on <body>.
const politeRegion = (container: HTMLElement) => container.querySelector('[data-os-announcer="polite"]')!;

function Viewer(props: Partial<LightboxProps>) {
  return (
    <AnnouncerProvider>
      <Lightbox images={images} defaultOpen {...props} />
    </AnnouncerProvider>
  );
}

describe('Lightbox', () => {
  it('renders nothing inside the dialog while closed, so no images load', () => {
    render(<Lightbox images={images} />);
    expect(dialog()).not.toHaveAttribute('open');
    expect(dialog().querySelector('img')).toBeNull();
  });

  it('opens a dialog named "Image viewer", described by the counter, with the image and its caption', async () => {
    const { container } = render(<Viewer />);
    const d = screen.getByRole('dialog', { name: 'Image viewer' });
    expect(d).toHaveAttribute('open');
    expect(d).toHaveAccessibleDescription('1 of 4');
    expect(screen.getByRole('img', { name: 'Harbor at dawn' })).toHaveAccessibleDescription('Fishing boats leave at first light.');
    expect(img()).toHaveAttribute('width', '1200');
    expect(dialog().querySelector('figcaption')).toHaveTextContent('Fishing boats leave at first light.');
    await expectNoAxeViolations(container);
  });

  it('takes a custom dialog name and labels', () => {
    render(<Viewer aria-label="Gallery" labels={{ counter: (n, t) => `Photo ${n} / ${t}`, next: 'Forward' }} />);
    expect(screen.getByRole('dialog', { name: 'Gallery' })).toBeInTheDocument();
    expect(counter()).toBe('Photo 1 / 4');
    expect(screen.getByRole('button', { name: 'Forward' })).toBeInTheDocument();
  });

  it('moves with the previous and next buttons, which are aria-disabled at the ends', async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    render(<Viewer onIndexChange={onIndexChange} />);
    const prev = screen.getByRole('button', { name: 'Previous image' });
    const next = screen.getByRole('button', { name: 'Next image' });
    expect(prev).toHaveAttribute('aria-disabled', 'true');
    await user.click(prev);
    expect(onIndexChange).not.toHaveBeenCalled();
    await user.click(next);
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
    expect(counter()).toBe('2 of 4');
    expect(screen.getByRole('img', { name: 'Dunes' })).toBeInTheDocument();
    await user.click(next);
    await user.click(next);
    expect(counter()).toBe('4 of 4');
    expect(next).toHaveAttribute('aria-disabled', 'true');
    // Focus stays on the button at the end (aria-disabled, not disabled).
    expect(next).toHaveFocus();
  });

  it('wraps with loop', async () => {
    const user = userEvent.setup();
    render(<Viewer loop />);
    await user.click(screen.getByRole('button', { name: 'Previous image' }));
    expect(counter()).toBe('4 of 4');
    await user.click(screen.getByRole('button', { name: 'Next image' }));
    expect(counter()).toBe('1 of 4');
  });

  it('navigates with Left/Right, Home and End', async () => {
    const user = userEvent.setup();
    render(<Viewer />);
    await user.keyboard('{ArrowRight}');
    expect(counter()).toBe('2 of 4');
    await user.keyboard('{End}');
    expect(counter()).toBe('4 of 4');
    await user.keyboard('{ArrowRight}');
    expect(counter()).toBe('4 of 4');
    await user.keyboard('{ArrowLeft}');
    expect(counter()).toBe('3 of 4');
    await user.keyboard('{Home}');
    expect(counter()).toBe('1 of 4');
    // Up and Down do nothing (and aren't swallowed) while not zoomed.
    expect(fireEvent.keyDown(stage(), { key: 'ArrowDown' })).toBe(true);
    expect(counter()).toBe('1 of 4');
  });

  it('swaps Left and Right in RTL', async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <Viewer />
      </div>,
    );
    await user.keyboard('{ArrowLeft}');
    expect(counter()).toBe('2 of 4');
    await user.keyboard('{ArrowRight}');
    expect(counter()).toBe('1 of 4');
  });

  it('closes on Escape and the close button', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Viewer onOpenChange={onOpenChange} />);
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(dialog()).not.toHaveAttribute('open'));
    onOpenChange.mockClear();
    render(<Viewer onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole('button', { name: 'Close image viewer' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('is controllable: open and index follow the props', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [open, setOpen] = useState(false);
      const [index, setIndex] = useState(2);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            View
          </button>
          <output data-testid="index">{index}</output>
          <Lightbox images={images} open={open} onOpenChange={setOpen} index={index} onIndexChange={setIndex} />
        </>
      );
    }
    render(<Controlled />);
    const opener = screen.getByRole('button', { name: 'View' });
    await user.click(opener);
    expect(counter()).toBe('3 of 4');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('index')).toHaveTextContent('3');
    expect(counter()).toBe('4 of 4');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(opener).toHaveFocus());
    expect(dialog().querySelector('img')).toBeNull();
  });

  it('a controlled index that never changes keeps the image', async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    render(<Viewer index={1} onIndexChange={onIndexChange} />);
    await user.keyboard('{ArrowRight}');
    expect(onIndexChange).toHaveBeenCalledWith(2);
    expect(counter()).toBe('2 of 4');
  });

  it('clamps an out-of-range index and renders nothing without images', () => {
    const { unmount } = render(<Viewer index={9} />);
    expect(counter()).toBe('4 of 4');
    unmount();
    render(<Lightbox images={[]} defaultOpen />);
    expect(dialog()).not.toHaveAttribute('open');
  });

  it('announces the position politely when it changes, not on open', async () => {
    const user = userEvent.setup();
    const { container } = render(<Viewer />);
    await new Promise((r) => setTimeout(r, 150));
    expect(politeRegion(container)).toBeEmptyDOMElement();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(politeRegion(container)).toHaveTextContent('2 of 4'));
    await user.keyboard('{End}');
    await waitFor(() => expect(politeRegion(container)).toHaveTextContent('4 of 4'));
  });

  it('shows a spinner while loading, then the image', () => {
    render(<Viewer />);
    expect(stage()).toHaveAttribute('data-status', 'loading');
    expect(within(stage()).getByRole('status')).toHaveTextContent('Loading image');
    fireEvent.load(img());
    expect(stage()).toHaveAttribute('data-status', 'loaded');
    expect(dialog().querySelector('.os-spinner')).toBeNull();
  });

  it('shows a broken-image state with the alt text when loading fails', () => {
    render(<Viewer />);
    fireEvent.error(img());
    expect(stage()).toHaveAttribute('data-status', 'error');
    expect(dialog().querySelector('img.os-lightbox__image')).toBeNull();
    const error = dialog().querySelector('.os-lightbox__error')!;
    expect(error).toHaveTextContent('This image couldn’t be loaded.');
    expect(error).toHaveTextContent('Harbor at dawn');
    expect(error.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    // Zoom is unavailable on a broken image.
    expect(screen.getByRole('button', { name: 'Zoom in' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('passes srcSet and sizes through and preloads the neighbors', async () => {
    const created: { src: string; srcset: string; sizes: string }[] = [];
    class FakeImage {
      src = '';
      srcset = '';
      sizes = '';
      constructor() {
        created.push(this);
      }
    }
    vi.stubGlobal('Image', FakeImage);
    const user = userEvent.setup();
    render(<Viewer />);
    expect(created.map((i) => i.src)).toEqual(['/b.jpg']);
    expect(created[0]).toMatchObject({ srcset: '/b-640.jpg 640w, /b-1280.jpg 1280w', sizes: '100vw' });
    await user.keyboard('{ArrowRight}');
    expect(img()).toHaveAttribute('srcset', '/b-640.jpg 640w, /b-1280.jpg 1280w');
    expect(img()).toHaveAttribute('sizes', '100vw');
    expect(created.slice(1).map((i) => i.src)).toEqual(['/a.jpg', '/c.jpg']);
  });

  it('shows a download link when the image allows it', async () => {
    const user = userEvent.setup();
    render(<Viewer />);
    expect(screen.queryByRole('link', { name: 'Download image' })).toBeNull();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('link', { name: 'Download image' })).toHaveAttribute('href', '/b.jpg');
    expect(screen.getByRole('link', { name: 'Download image' })).toHaveAttribute('download');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('link', { name: 'Download image' })).toHaveAttribute('href', '/c-original.tif');
  });

  it('shows a thumbnail strip with aria-current', async () => {
    const user = userEvent.setup();
    const { container } = render(<Viewer thumbnails />);
    const strip = screen.getByRole('group', { name: 'Thumbnails' });
    const thumbs = within(strip).getAllByRole('button');
    expect(thumbs).toHaveLength(4);
    expect(thumbs[0]).toHaveAccessibleName('Harbor at dawn, image 1 of 4');
    expect(thumbs[0]).toHaveAttribute('aria-current', 'true');
    expect(thumbs[0]!.querySelector('img')).toHaveAttribute('src', '/a-thumb.jpg');
    await user.click(thumbs[2]!);
    expect(counter()).toBe('3 of 4');
    expect(thumbs[2]).toHaveAttribute('aria-current', 'true');
    expect(thumbs[0]).not.toHaveAttribute('aria-current');
    // A thumbnail that fails to load shows an icon, keeping its name.
    fireEvent.error(thumbs[3]!.querySelector('img')!);
    expect(thumbs[3]!.querySelector('img')).toBeNull();
    expect(thumbs[3]!.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(thumbs[3]).toHaveAccessibleName('City at night, image 4 of 4');
    await expectNoAxeViolations(container);
  });

  it('zooms with + and -, resets with 0, and announces the level', async () => {
    const user = userEvent.setup();
    const { container } = render(<Viewer />);
    // Nothing to zoom until the image has loaded.
    await user.keyboard('+');
    expect(img().style.transform).toBe('');
    fireEvent.load(img());
    await user.keyboard('+');
    expect(img().style.transform).toContain('scale(1.5)');
    expect(dialog().querySelector('[data-zoomed]')).not.toBeNull();
    await waitFor(() => expect(politeRegion(container)).toHaveTextContent('Zoom 150%'));
    await user.keyboard('=');
    await user.keyboard('+');
    await user.keyboard('+');
    await user.keyboard('+');
    await user.keyboard('+');
    expect(img().style.transform).toContain('scale(4)');
    expect(screen.getByRole('button', { name: 'Zoom in' })).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('-');
    expect(img().style.transform).toContain('scale(3.5)');
    await user.keyboard('0');
    expect(img().style.transform).toBe('');
    await waitFor(() => expect(politeRegion(container)).toHaveTextContent('Zoom 100%'));
    expect(screen.getByRole('button', { name: 'Zoom out' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('counts quick key repeats that land before a re-render', () => {
    render(<Viewer />);
    fireEvent.load(img());
    act(() => {
      fireEvent.keyDown(stage(), { key: '+' });
      fireEvent.keyDown(stage(), { key: '+' });
    });
    expect(img().style.transform).toContain('scale(2)');
  });

  it('zooms with the buttons, up to maxZoom', async () => {
    const user = userEvent.setup();
    render(<Viewer maxZoom={2} />);
    fireEvent.load(img());
    const zoomIn = screen.getByRole('button', { name: 'Zoom in' });
    await user.click(zoomIn);
    await user.click(zoomIn);
    await user.click(zoomIn);
    expect(img().style.transform).toContain('scale(2)');
    expect(zoomIn).toHaveAttribute('aria-disabled', 'true');
    await user.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(img().style.transform).toContain('scale(1.5)');
  });

  it('pans with the arrows while zoomed (and only then), inside the image edges', async () => {
    const user = userEvent.setup();
    render(<Viewer />);
    fireEvent.load(img());
    const size = (el: HTMLElement, w: number, h: number, kind: 'offset' | 'client') => {
      Object.defineProperty(el, `${kind}Width`, { configurable: true, value: w });
      Object.defineProperty(el, `${kind}Height`, { configurable: true, value: h });
    };
    size(img(), 800, 600, 'offset');
    size(stage(), 800, 600, 'client');
    await user.keyboard('+');
    await user.keyboard('+');
    expect(img().style.transform).toBe('translate3d(0px, 0px, 0) scale(2)');
    await user.keyboard('{ArrowLeft}');
    expect(img().style.transform).toBe('translate3d(48px, 0px, 0) scale(2)');
    expect(counter()).toBe('1 of 4');
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(img().style.transform).toBe('translate3d(48px, 96px, 0) scale(2)');
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowDown}');
    expect(img().style.transform).toBe('translate3d(-48px, 48px, 0) scale(2)');
    // Clamped: at 2× an 800px image can move 400px each way.
    for (let i = 0; i < 12; i++) await user.keyboard('{ArrowRight}');
    expect(img().style.transform).toBe('translate3d(-400px, 48px, 0) scale(2)');
    expect(counter()).toBe('1 of 4');
    // Home/End still navigate, and a new image starts unzoomed.
    await user.keyboard('{End}');
    expect(counter()).toBe('4 of 4');
    expect(img().style.transform).toBe('');
  });

  it('swipes to navigate on touch, but not while zoomed', () => {
    render(<Viewer />);
    fireEvent.load(img());
    drag(stage(), { x: 300 }, { x: 100 });
    expect(counter()).toBe('2 of 4');
    drag(stage(), { x: 100 }, { x: 300 });
    expect(counter()).toBe('1 of 4');
    // Mouse drags don't swipe.
    drag(stage(), { x: 300, type: 'mouse' }, { x: 100 });
    expect(counter()).toBe('1 of 4');
    fireEvent.keyDown(stage(), { key: '+' });
    drag(stage(), { x: 300 }, { x: 100 });
    expect(counter()).toBe('1 of 4');
  });

  it('swipes the other way in RTL', () => {
    render(
      <div dir="rtl">
        <Viewer />
      </div>,
    );
    drag(stage(), { x: 100 }, { x: 300 });
    expect(counter()).toBe('2 of 4');
  });

  it('toggles 2× zoom on a double tap, and pans by dragging while zoomed', () => {
    render(<Viewer />);
    fireEvent.load(img());
    const tap = () => drag(stage(), { x: 100, y: 100 }, { x: 102, y: 101 });
    tap();
    expect(img().style.transform).toBe('');
    tap();
    expect(img().style.transform).toContain('scale(2)');
    Object.defineProperty(img(), 'offsetWidth', { configurable: true, value: 800 });
    Object.defineProperty(img(), 'offsetHeight', { configurable: true, value: 600 });
    Object.defineProperty(stage(), 'clientWidth', { configurable: true, value: 800 });
    Object.defineProperty(stage(), 'clientHeight', { configurable: true, value: 600 });
    pointer('pointerDown', stage(), { x: 200, y: 200 });
    pointer('pointerMove', stage(), { x: 260, y: 170 });
    expect(stage()).toHaveAttribute('data-gesture');
    expect(img().style.transform).toMatch(/translate3d\(-?\d+(\.\d+)?px, -?\d+(\.\d+)?px, 0\) scale\(2\)/);
    const before = img().style.transform;
    pointer('pointerMove', stage(), { x: 300, y: 170 });
    expect(img().style.transform).not.toBe(before);
    pointer('pointerUp', stage(), { x: 300, y: 170 });
    expect(stage()).not.toHaveAttribute('data-gesture');
    tap();
    tap();
    expect(img().style.transform).toBe('');
  });

  it('pinches to zoom with two pointers, clamped to 1×–maxZoom', () => {
    render(<Viewer />);
    fireEvent.load(img());
    pointer('pointerDown', stage(), { x: 100, id: 1 });
    pointer('pointerDown', stage(), { x: 200, id: 2 });
    pointer('pointerMove', stage(), { x: 300, id: 2 });
    expect(img().style.transform).toContain('scale(2)');
    pointer('pointerMove', stage(), { x: 1000, id: 2 });
    expect(img().style.transform).toContain('scale(4)');
    pointer('pointerUp', stage(), { x: 1000, id: 2 });
    pointer('pointerUp', stage(), { x: 100, id: 1 });
    expect(counter()).toBe('1 of 4');
    pointer('pointerDown', stage(), { x: 100, id: 3 });
    pointer('pointerDown', stage(), { x: 500, id: 4 });
    pointer('pointerMove', stage(), { x: 110, id: 4 });
    pointer('pointerCancel', stage(), { x: 110, id: 4 });
    pointer('pointerCancel', stage(), { x: 100, id: 3 });
    expect(img().style.transform).toBe('');
    expect(counter()).toBe('1 of 4');
  });

  it('warns once in development when an image has no alt text', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Lightbox images={[{ src: '/x.jpg', alt: '' }]} defaultOpen />);
    render(<Lightbox images={[{ src: '/y.jpg', alt: ' ' }]} defaultOpen />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain('empty alt text');
  });
});

describe('LightboxGallery', () => {
  it('renders a list of "Open <alt>" buttons that open the viewer at that image and return focus there', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AnnouncerProvider>
        <LightboxGallery images={images} aria-label="Travel photos" lightboxProps={{ thumbnails: true }} />
      </AnnouncerProvider>,
    );
    const list = screen.getByRole('list', { name: 'Travel photos' });
    const buttons = within(list).getAllByRole('button');
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(['Open Harbor at dawn', 'Open Dunes', 'Open Glacier', 'Open City at night']);
    expect(buttons[0]!.querySelector('img')).toHaveAttribute('src', '/a-thumb.jpg');
    expect(buttons[0]!.querySelector('img')).toHaveAttribute('loading', 'lazy');
    await expectNoAxeViolations(container);
    await user.click(buttons[2]!);
    expect(screen.getByRole('dialog', { name: 'Image viewer' })).toHaveAttribute('open');
    expect(counter()).toBe('3 of 4');
    // Moving on inside the viewer still returns focus to the thumbnail that opened it.
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(buttons[2]).toHaveFocus());
  });

  it('is controllable and shows an icon for a broken thumbnail', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onIndexChange = vi.fn();
    render(<LightboxGallery images={images} onOpenChange={onOpenChange} onIndexChange={onIndexChange} openLabel={(img, i) => `View ${i + 1}: ${img.alt}`} />);
    const button = screen.getByRole('button', { name: 'View 2: Dunes' });
    fireEvent.error(button.querySelector('img')!);
    expect(button.querySelector('img')).toBeNull();
    expect(button.querySelector('svg')).not.toBeNull();
    await user.click(button);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(onIndexChange).toHaveBeenCalledWith(1);
  });

  it('stays closed while open is controlled false', async () => {
    const user = userEvent.setup();
    render(<LightboxGallery images={images} open={false} />);
    await user.click(screen.getByRole('button', { name: 'Open Dunes' }));
    expect(dialog()).not.toHaveAttribute('open');
  });
});
