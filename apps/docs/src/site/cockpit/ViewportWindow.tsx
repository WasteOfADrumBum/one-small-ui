import type { HTMLAttributes, ReactNode } from 'react';

export interface ViewportWindowProps extends HTMLAttributes<HTMLDivElement> {
  /** Which way the angled frame leans. Two windows side by side read as one cockpit canopy. */
  side?: 'left' | 'right';
  /** The part of the scene this pane shows, in scene units. Neighbouring panes can share one scene. */
  viewBox: string;
  /** SVG content of the scene. */
  children: ReactNode;
}

/**
 * A pane of cockpit glass with a thick angled frame. The SVG inside is decorative:
 * give the group of windows `role="img"` and a label that describes the whole view.
 */
export function ViewportWindow({ side = 'left', viewBox, children, className, ...rest }: ViewportWindowProps) {
  return (
    <div className={['docs-viewport', className].filter(Boolean).join(' ')} data-side={side} {...rest}>
      <div className="docs-viewport__glass">
        <svg className="docs-viewport__scene" viewBox={viewBox} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          {children}
        </svg>
        <span className="docs-viewport__sheen" aria-hidden="true" />
      </div>
    </div>
  );
}
