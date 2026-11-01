import { computePosition } from '../src/utils/position';

// jsdom has no layout, so the panel's size and the viewport are stubbed. Real-browser checks for every
// floating component live in `npm run test:layout` (short-viewport section).
function panel(width: number, height: number) {
  const el = document.createElement('div');
  Object.defineProperty(el, 'offsetWidth', { value: width });
  Object.defineProperty(el, 'offsetHeight', { value: height });
  return el;
}
const rect = (top: number, left: number, width: number, height: number) => ({
  getBoundingClientRect: () => ({ top, left, width, height, right: left + width, bottom: top + height }),
});

describe('computePosition on short viewports', () => {
  beforeEach(() => {
    Object.defineProperty(document.documentElement, 'clientWidth', { value: 640, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 320, configurable: true });
  });

  it('keeps a panel that fits on neither side inside the viewport', () => {
    const r = computePosition(rect(140, 100, 80, 32), panel(200, 400), { placement: 'bottom', offset: 8, padding: 8 });
    expect(r.y).toBe(8);
    expect(r.y + 400).toBeGreaterThan(320); // taller than the viewport: still starts on screen
    expect(r.availableHeight).toBe(320 - 140 - 32 - 8 - 8);
  });

  it('reports the room on the side it uses, so CSS can cap the panel and scroll', () => {
    const r = computePosition(rect(250, 100, 80, 32), panel(200, 280), { placement: 'bottom', offset: 8, padding: 8 });
    expect(r.side).toBe('top'); // more room above
    expect(r.availableHeight).toBe(250 - 8 - 8);
    expect(r.y).toBeGreaterThanOrEqual(8);
    expect(r.y + 280).toBeLessThanOrEqual(320 - 8);
  });

  it('leaves a panel that fits exactly where it was', () => {
    const r = computePosition(rect(20, 100, 80, 32), panel(200, 100), { placement: 'bottom', offset: 8, padding: 8 });
    expect(r).toMatchObject({ side: 'bottom', y: 60 });
  });

  it('does not pin a panel whose anchor scrolled out of view, or a point anchor', () => {
    const gone = computePosition(rect(-200, 100, 80, 32), panel(200, 100), { placement: 'bottom', offset: 8, padding: 8 });
    expect(gone.y).toBe(-200 + 32 + 8);
    const point = computePosition(rect(160, 100, 0, 0), panel(200, 400), { placement: 'bottom', offset: 2, padding: 8 });
    expect(point.y).toBe(162);
  });

  it('clamps the inline position for left and right placements too', () => {
    Object.defineProperty(document.documentElement, 'clientWidth', { value: 320, configurable: true });
    const r = computePosition(rect(100, 140, 40, 32), panel(200, 60), { placement: 'right', offset: 8, padding: 8 });
    expect(r.x).toBeGreaterThanOrEqual(8);
    expect(r.x + 200).toBeLessThanOrEqual(320 - 8);
  });
});
