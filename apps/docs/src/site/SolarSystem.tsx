import { useEffect, useRef, useState } from 'react';
import { Button } from 'onesmallui';
import {
  CENTER,
  MARS,
  PLANETS,
  SUN_RADIUS,
  TILT,
  TRANSFER_YEARS,
  VIEW,
  YEARS_PER_SECOND,
  nextLaunch,
  orbitAxes,
  period,
  planetPosition,
  project,
  screenSpeed,
  transferPosition,
  type Projected,
} from './orbitalMath';

// Planet colors per theme. Each one is at least 3:1 against its theme's page background.
const PALETTE = {
  dark: ['#b9b4ae', '#f5dd9a', '#5ca8ff', '#ff6b4a', '#e3a571', '#d9b45c', '#7fe7ff', '#9b95ff'],
  light: ['#5f5a55', '#8a5f00', '#1d5bbf', '#b3321a', '#94531f', '#6f5a12', '#006a80', '#3a3dbf'],
};

/** Galactic drift in view units per second, along the track toward the upper right. */
const DRIFT_SPEED = 1.5;
const DRIFT = { x: Math.cos(Math.PI / 5), y: -Math.sin(Math.PI / 5) };
const TRACK_DASH = [2, 9];
const TRAIL_SAMPLES = 14;
const LAND_SECONDS = 0.5;
const STATIC_YEARS = nextLaunch(0) + TRANSFER_YEARS / 2; // reduced motion: ship parked mid-arc

interface Colors {
  bg: string;
  text: string;
  primary: string;
  accent: string;
  planets: string[];
}

function rgb(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgba(hex: string, alpha: number) {
  return `rgba(${rgb(hex).join(', ')}, ${alpha})`;
}

function mix(a: string, b: string, t: number) {
  const ca = rgb(a);
  const cb = rgb(b);
  return `rgb(${ca.map((v, i) => Math.round(v + (cb[i] - v) * t)).join(', ')})`;
}

function readColors(el: Element): Colors {
  const css = getComputedStyle(el);
  const v = (name: string, fallback: string) => {
    const value = css.getPropertyValue(name).trim();
    return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
  };
  const bg = v('--os-bg', '#04060c');
  const light = rgb(bg).reduce((s, c) => s + c, 0) > 382;
  return {
    bg,
    text: v('--os-text', light ? '#070b18' : '#eef2ff'),
    primary: v('--os-primary', light ? '#00557a' : '#5ce1ff'),
    accent: v('--os-accent', light ? '#4b1fb8' : '#b9a0ff'),
    planets: light ? PALETTE.light : PALETTE.dark,
  };
}

/** The Sun is drawn once per size and theme, then blitted every frame. */
function paintSun(c: Colors, scale: number) {
  const size = Math.ceil(SUN_RADIUS * 4 * scale);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const mid = size / 2;
  ctx.scale(scale, scale);
  const m = mid / scale;
  const glow = ctx.createRadialGradient(m, m, SUN_RADIUS * 0.6, m, m, SUN_RADIUS * 2);
  glow.addColorStop(0, rgba(c.primary, 0.35));
  glow.addColorStop(0.45, rgba(c.accent, 0.12));
  glow.addColorStop(1, rgba(c.primary, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, m * 2, m * 2);
  const core = ctx.createRadialGradient(m, m, 0, m, m, SUN_RADIUS);
  core.addColorStop(0, mix(c.bg, c.primary, 0.12));
  core.addColorStop(0.75, mix(c.bg, c.primary, 0.2));
  core.addColorStop(1, mix(c.bg, c.accent, 0.35));
  ctx.beginPath();
  ctx.arc(m, m, SUN_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = core;
  ctx.fill();
  const rim = ctx.createLinearGradient(m - SUN_RADIUS, m - SUN_RADIUS, m + SUN_RADIUS, m + SUN_RADIUS);
  rim.addColorStop(0, c.primary);
  rim.addColorStop(1, c.accent);
  ctx.strokeStyle = rim;
  ctx.lineWidth = 2;
  ctx.stroke();
  return canvas;
}

function draw(ctx: CanvasRenderingContext2D, c: Colors, sun: HTMLCanvasElement, years: number, scale: number) {
  const seconds = years / YEARS_PER_SECOND;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  // Galactic track: the dashes stream past as the system drifts along it, and loop seamlessly.
  const reach = VIEW * 0.75;
  ctx.beginPath();
  ctx.moveTo(CENTER - DRIFT.x * reach, CENTER - DRIFT.y * reach);
  ctx.lineTo(CENTER + DRIFT.x * reach, CENTER + DRIFT.y * reach);
  ctx.setLineDash(TRACK_DASH);
  ctx.lineDashOffset = (seconds * DRIFT_SPEED) % (TRACK_DASH[0] + TRACK_DASH[1]);
  ctx.strokeStyle = rgba(c.text, 0.16);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.setLineDash([]);

  // Orbits: far halves behind the Sun, near halves in front.
  const orbits = (near: boolean) => {
    PLANETS.forEach((p, i) => {
      const { a, b } = orbitAxes(p);
      ctx.beginPath();
      ctx.ellipse(CENTER, CENTER, a, b * Math.cos(TILT), 0, near ? 0 : Math.PI, near ? Math.PI : Math.PI * 2);
      ctx.strokeStyle = rgba(i < 4 ? c.primary : c.accent, 0.3);
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  };

  // Everything that moves, sorted by depth so near bodies cover far ones.
  const bodies: { z: number; paint: () => void }[] = [];

  PLANETS.forEach((p, i) => {
    const pos = project(planetPosition(p, years));
    const color = c.planets[i];
    const r = p.size * (1 + (0.12 * pos.z) / VIEW);
    bodies.push({
      z: pos.z,
      paint: () => {
        // Short trail in the galactic frame: past positions shifted back along the drift,
        // so each one is a short helix segment. Skipped where drift would outpace the orbit.
        if (screenSpeed(p) > DRIFT_SPEED * 2) {
          const span = Math.min(period(p.au) * 0.08, 2 * YEARS_PER_SECOND);
          let prev: Projected = pos;
          for (let k = 1; k <= TRAIL_SAMPLES; k++) {
            const age = (span * k) / TRAIL_SAMPLES;
            const q = project(planetPosition(p, years - age));
            const back = (age / YEARS_PER_SECOND) * DRIFT_SPEED;
            const pt = { x: q.x - DRIFT.x * back, y: q.y - DRIFT.y * back, z: q.z };
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(pt.x, pt.y);
            ctx.strokeStyle = rgba(color, 0.45 * (1 - k / TRAIL_SAMPLES));
            ctx.lineWidth = Math.max(1, r * 0.55);
            ctx.lineCap = 'round';
            ctx.stroke();
            prev = pt;
          }
        }
        const ring = (near: boolean) => {
          ctx.beginPath();
          ctx.ellipse(pos.x, pos.y, r * 2.1, r * 2.1 * Math.cos(TILT), -0.25, near ? 0 : Math.PI, near ? Math.PI : Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        };
        if (p.ring) ring(false);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        if (p.ring) ring(true);
      },
    });
  });

  // Ship: flies the transfer arc, then lands on Mars (shrinks and fades over half a second).
  const launch = nextLaunch(years - TRANSFER_YEARS - LAND_SECONDS * YEARS_PER_SECOND);
  const flight = (years - launch) / TRANSFER_YEARS;
  if (flight >= 0) {
    const landing = flight > 1 ? (years - launch - TRANSFER_YEARS) / YEARS_PER_SECOND / LAND_SECONDS : 0;
    const s = Math.min(flight, 1);
    const pos = flight > 1 ? project(planetPosition(PLANETS[MARS], years)) : project(transferPosition(launch, s));
    const ahead = project(transferPosition(launch, Math.min(s + 0.01, 1)));
    const behind = project(transferPosition(launch, Math.max(s - 0.01, 0)));
    const heading = Math.atan2(ahead.y - behind.y, ahead.x - behind.x);
    const k = 1 - landing * 0.8;
    bodies.push({
      z: pos.z + 0.01,
      paint: () => {
        ctx.save();
        ctx.globalAlpha = 1 - landing;
        ctx.translate(pos.x, pos.y);
        ctx.rotate(heading);
        ctx.scale(k, k);
        const flame = ctx.createRadialGradient(-5, 0, 0, -5, 0, 5);
        flame.addColorStop(0, rgba(c.primary, 0.9));
        flame.addColorStop(1, rgba(c.primary, 0));
        ctx.fillStyle = flame;
        ctx.fillRect(-10, -5, 10, 10);
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(-4, -3.6);
        ctx.lineTo(-2.4, 0);
        ctx.lineTo(-4, 3.6);
        ctx.closePath();
        ctx.fillStyle = c.text;
        ctx.fill();
        ctx.restore();
      },
    });
  }

  bodies.sort((a, b) => a.z - b.z);
  orbits(false);
  let i = 0;
  for (; i < bodies.length && bodies[i].z < 0; i++) bodies[i].paint();
  ctx.drawImage(sun, CENTER - SUN_RADIUS * 2, CENTER - SUN_RADIUS * 2, SUN_RADIUS * 4, SUN_RADIUS * 4);
  orbits(true);
  for (; i < bodies.length; i++) bodies[i].paint();
}

export function SolarSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [paused, setPaused] = useState(reduced);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const sync = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let years = reduced ? STATIC_YEARS : 0;
    let colors = readColors(canvas);
    let scale = 1;
    let sun = paintSun(colors, scale);
    let visible = true;
    let frame = 0;
    let last = 0;

    const render = () => draw(ctx, colors, sun, years, scale);
    const tick = (now: number) => {
      years += Math.min((now - last) / 1000, 0.1) * YEARS_PER_SECOND;
      last = now;
      render();
      frame = requestAnimationFrame(tick);
    };
    const update = () => {
      const run = !pausedRef.current && visible && !document.hidden;
      if (run && !frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      } else if (!run && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    sync.current = update;

    const resize = () => {
      const px = Math.round(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2));
      if (!px || px === canvas.width) return;
      canvas.width = canvas.height = px;
      scale = px / VIEW;
      sun = paintSun(colors, scale);
      render();
    };
    const retheme = () => {
      colors = readColors(canvas);
      sun = paintSun(colors, scale);
      render();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    io.observe(canvas);
    const mo = new MutationObserver(retheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-os-theme', 'class', 'style'] });
    const scheme = matchMedia('(prefers-color-scheme: dark)');
    scheme.addEventListener('change', retheme);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => motion.matches && setPaused(true);
    motion.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', update);

    resize();
    render();
    update();
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      scheme.removeEventListener('change', retheme);
      motion.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', update);
    };
    // Runs once; pause state is read through pausedRef.
  }, []);

  useEffect(() => sync.current(), [paused]);

  return (
    <div className="docs-solar">
      <div
        className="docs-solar__scene"
        role="img"
        aria-label="The solar system on a tilted plane: the Sun glows behind the 1SmUI wordmark, eight planets circle it at their real relative speeds, and a small ship flies a transfer arc from Earth to Mars."
      >
        <canvas ref={canvasRef} className="docs-solar__canvas" aria-hidden="true" />
        <svg className="docs-solar__wordmark" viewBox={`0 0 ${VIEW} ${VIEW}`} aria-hidden="true" focusable="false">
          <text x={CENTER} y={CENTER + 9} textAnchor="middle">
            1SmUI
          </text>
        </svg>
      </div>
      <Button
        className="docs-solar__toggle"
        variant="ghost"
        color="neutral"
        iconOnly
        aria-label={paused ? 'Play animation' : 'Pause animation'}
        onClick={() => setPaused((p) => !p)}
      >
        {paused ? (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v13l10.5-6.5z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6.5" y="5" width="4" height="14" rx="1" />
            <rect x="13.5" y="5" width="4" height="14" rx="1" />
          </svg>
        )}
      </Button>
    </div>
  );
}
