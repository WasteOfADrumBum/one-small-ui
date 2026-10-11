import type { CSSProperties } from 'react';

export interface RadarContact {
  id: string;
  name: string;
  /** Degrees clockwise from north (top). */
  bearing: number;
  /** 0–1, distance from the center as a share of the scope radius. */
  distance: number;
  /** Range as read out, such as "384,400 km". */
  range: string;
  /** Unknown contacts are drawn in amber. */
  unknown?: boolean;
}

export interface RadarProps {
  contacts: RadarContact[];
  selected?: string | null;
  onSelect?: (id: string) => void;
  /** Names the list of blips. */
  label?: string;
  className?: string;
}

/**
 * A radar scope with a rotating sweep. Each blip is a button; the selected contact's name,
 * range and bearing are announced through a polite live region under the scope.
 * The sweep stops under reduced motion or when an ancestor sets `data-motion="paused"`.
 */
export function Radar({ contacts, selected, onSelect, label = 'Radar contacts', className }: RadarProps) {
  const current = contacts.find((c) => c.id === selected);
  return (
    <div className={['docs-radar', className].filter(Boolean).join(' ')}>
      <div className="docs-radar__scope">
        <svg className="docs-radar__art" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="docs-radar-sweep" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="currentColor" stopOpacity="0" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0.45" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="98" className="docs-radar__disc" />
          {[32, 64, 96].map((r) => (
            <circle key={r} cx="100" cy="100" r={r} className="docs-radar__ring" />
          ))}
          <path d="M100 4V196M4 100H196" className="docs-radar__ring" />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1="100" y1="4" x2="100" y2="11" className="docs-radar__tick" transform={`rotate(${i * 30} 100 100)`} />
          ))}
          <g className="docs-radar__sweep">
            <path d="M100 100L100 4A96 96 0 0 1 183.1 52Z" fill="url(#docs-radar-sweep)" />
            <line x1="100" y1="100" x2="183.1" y2="52" className="docs-radar__beam" />
          </g>
        </svg>
        <ul className="docs-radar__blips" aria-label={label}>
          {contacts.map((c) => {
            const a = (c.bearing * Math.PI) / 180;
            const r = c.distance * 48;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  className="docs-radar__blip"
                  data-unknown={c.unknown || undefined}
                  aria-pressed={c.id === selected}
                  aria-label={c.name}
                  style={{ left: `${50 + Math.sin(a) * r}%`, top: `${50 - Math.cos(a) * r}%` } as CSSProperties}
                  onClick={() => onSelect?.(c.id)}
                />
              </li>
            );
          })}
        </ul>
      </div>
      <div className="docs-radar__readout" aria-live="polite" aria-atomic="true">
        {current ? (
          <>
            <strong>{current.name}</strong>
            <span>
              Range {current.range} · Bearing {String(Math.round(current.bearing)).padStart(3, '0')}°
            </span>
          </>
        ) : (
          <span>Select a blip to read its range and bearing.</span>
        )}
      </div>
    </div>
  );
}
