/** Scene coordinates shared by both cockpit windows: the left pane shows x 0–600, the right x 600–1200. */
export const SCENE = { width: 1200, height: 420 };

export type SceneObject = 'moon' | 'satellite' | 'unknown-1' | 'unknown-2';

export const SCENE_POSITIONS: Record<Exclude<SceneObject, 'satellite'>, { x: number; y: number }> = {
  moon: { x: 230, y: 92 },
  'unknown-1': { x: 955, y: 74 },
  'unknown-2': { x: 470, y: 222 },
};

const EARTH = { cx: 600, cy: 1900, r: 1600 };

// Deterministic starfield, so both panes and every render agree.
function stars(seed: number, count: number) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: count }, () => ({ x: rand() * SCENE.width, y: rand() * 330, r: 0.6 + rand() * 1.2, o: 0.45 + rand() * 0.55 }));
}
const FAR_STARS = stars(7, 90);
const NEAR_STARS = stars(42, 28).map((s) => ({ ...s, r: s.r + 0.5 }));

function Reticle({ x = 0, y = 0, size = 22 }: { x?: number; y?: number; size?: number }) {
  const s = size;
  const k = size * 0.45;
  return (
    <g className="docs-scene__reticle" transform={`translate(${x} ${y})`}>
      <path d={`M${-s} ${-s + k}V${-s}H${-s + k}M${s - k} ${-s}H${s}V${-s + k}M${s} ${s - k}V${s}H${s - k}M${-s + k} ${s}H${-s}V${s - k}`} />
      <circle r={s * 0.62} strokeDasharray="3 4" />
    </g>
  );
}

export interface SpaceSceneProps {
  /** Unique per pane: prefixes the SVG ids. */
  idPrefix: string;
  selected?: string | null;
  /** 0–1. Opacity of the hex shield shimmer. */
  shield: number;
  autopilot: boolean;
}

/** Earth's limb, the Moon, a drifting satellite, two unknown contacts and sun glare, drawn in scene units. */
export function SpaceScene({ idPrefix: p, selected, shield, autopilot }: SpaceSceneProps) {
  const id = (name: string) => `${p}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  return (
    <>
      <defs>
        <linearGradient id={id('space')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#020512" />
          <stop offset="1" stopColor="#0b1736" />
        </linearGradient>
        <radialGradient id={id('earth')} gradientUnits="userSpaceOnUse" cx="360" cy="300" r="900">
          <stop offset="0" stopColor="#5cb8ff" />
          <stop offset="0.35" stopColor="#1d5bbf" />
          <stop offset="0.75" stopColor="#0b2a66" />
          <stop offset="1" stopColor="#04122e" />
        </radialGradient>
        <radialGradient id={id('atmo')} gradientUnits="userSpaceOnUse" cx={EARTH.cx} cy={EARTH.cy} r={EARTH.r + 46}>
          <stop offset={EARTH.r / (EARTH.r + 46) - 0.004} stopColor="#7fe7ff" stopOpacity="0.75" />
          <stop offset={EARTH.r / (EARTH.r + 46) + 0.01} stopColor="#5ca8ff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#5ca8ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('night')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.25" stopColor="#020617" stopOpacity="0" />
          <stop offset="1" stopColor="#020617" stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id={id('moon')} cx="0.35" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#f1f3f8" />
          <stop offset="1" stopColor="#8d93a3" />
        </radialGradient>
        <radialGradient id={id('sun')} gradientUnits="userSpaceOnUse" cx="30" cy="10" r="320">
          <stop offset="0" stopColor="#fffdf2" stopOpacity="0.95" />
          <stop offset="0.12" stopColor="#ffe9b0" stopOpacity="0.6" />
          <stop offset="0.45" stopColor="#ffd28a" stopOpacity="0.12" />
          <stop offset="1" stopColor="#ffd28a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('streak')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff7dc" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff7dc" stopOpacity="0" />
        </linearGradient>
        <pattern id={id('hex')} width="24" height="41.6" patternUnits="userSpaceOnUse">
          <path d="M12 0L24 6.9V20.8L12 27.7L0 20.8V6.9ZM12 27.7V41.6" fill="none" stroke="#7fe7ff" strokeWidth="0.8" />
        </pattern>
        <clipPath id={id('earth-clip')}>
          <circle cx={EARTH.cx} cy={EARTH.cy} r={EARTH.r} />
        </clipPath>
      </defs>

      <rect width={SCENE.width} height={SCENE.height} fill={url('space')} />
      <g className="docs-scene__stars" data-depth="far">
        {FAR_STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#dfe8ff" opacity={s.o} />
        ))}
      </g>
      <g className="docs-scene__stars" data-depth="near">
        {NEAR_STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" opacity={s.o} />
        ))}
      </g>

      <g className="docs-scene__object" data-selected={selected === 'moon' || undefined}>
        <circle cx={SCENE_POSITIONS.moon.x} cy={SCENE_POSITIONS.moon.y} r="16" fill={url('moon')} />
        <circle cx={SCENE_POSITIONS.moon.x - 5} cy={SCENE_POSITIONS.moon.y - 3} r="3.2" fill="#9aa0ae" opacity="0.7" />
        <circle cx={SCENE_POSITIONS.moon.x + 6} cy={SCENE_POSITIONS.moon.y + 5} r="2.2" fill="#9aa0ae" opacity="0.6" />
        {selected === 'moon' && <Reticle {...SCENE_POSITIONS.moon} size={26} />}
      </g>

      {(['unknown-1', 'unknown-2'] as const).map((k) => (
        <g key={k} className="docs-scene__object" data-selected={selected === k || undefined}>
          <path
            d={`M${SCENE_POSITIONS[k].x} ${SCENE_POSITIONS[k].y - 4}l4 7h-8z`}
            fill="#ffd28a"
            opacity={selected === k ? 1 : 0.7}
          />
          {selected === k && <Reticle {...SCENE_POSITIONS[k]} size={16} />}
        </g>
      ))}

      <circle cx={EARTH.cx} cy={EARTH.cy} r={EARTH.r + 46} fill={url('atmo')} />
      <circle cx={EARTH.cx} cy={EARTH.cy} r={EARTH.r} fill={url('earth')} />
      <g clipPath={url('earth-clip')}>
        <ellipse cx="300" cy="352" rx="150" ry="14" fill="#ffffff" opacity="0.18" />
        <ellipse cx="560" cy="330" rx="110" ry="9" fill="#ffffff" opacity="0.16" />
        <ellipse cx="820" cy="350" rx="170" ry="12" fill="#ffffff" opacity="0.12" />
        <ellipse cx="1040" cy="395" rx="120" ry="10" fill="#ffffff" opacity="0.1" />
        <rect width={SCENE.width} height={SCENE.height} fill={url('night')} />
      </g>
      <circle cx={EARTH.cx} cy={EARTH.cy} r={EARTH.r} fill="none" stroke="#bff3ff" strokeOpacity="0.55" strokeWidth="1.5" />

      <g className="docs-scene__sat-track" data-autopilot={autopilot || undefined}>
        <g transform="translate(600 168)">
          <g className="docs-scene__sat-drift" data-selected={selected === 'satellite' || undefined}>
            <rect x="-25" y="-4.5" width="17" height="9" fill="#2c5fc4" stroke="#a6c6ff" strokeWidth="0.8" />
            <rect x="8" y="-4.5" width="17" height="9" fill="#2c5fc4" stroke="#a6c6ff" strokeWidth="0.8" />
            <path d="M-8 0H8" stroke="#c9d3e6" strokeWidth="1.2" />
            <rect x="-5" y="-6.5" width="10" height="13" rx="2" fill="#e3e8f3" />
            <path d="M0 -6.5V-13" stroke="#e3e8f3" strokeWidth="1" />
            <circle cy="-14" r="1.8" fill="#7fe7ff" />
            {selected === 'satellite' && <Reticle size={34} />}
          </g>
        </g>
      </g>

      <g className="docs-scene__glare">
        <circle cx="30" cy="10" r="320" fill={url('sun')} />
        <rect x="0" y="-4" width="760" height="8" rx="4" fill={url('streak')} transform="translate(30 10) rotate(24)" />
        <circle cx="290" cy="128" r="16" fill="#b9a0ff" opacity="0.12" />
        <circle cx="400" cy="178" r="7" fill="#7fe7ff" opacity="0.18" />
        <circle cx="520" cy="232" r="30" fill="none" stroke="#ffe9b0" strokeOpacity="0.14" strokeWidth="3" />
      </g>

      <g className="docs-scene__shield" style={{ opacity: shield }}>
        <rect width={SCENE.width} height={SCENE.height} fill={url('hex')} />
      </g>
    </>
  );
}
