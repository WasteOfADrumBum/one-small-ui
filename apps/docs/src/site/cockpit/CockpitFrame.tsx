import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';

export interface CockpitFrameProps extends HTMLAttributes<HTMLDivElement> {
  /** 0–1. Brightness of the engine glow along the frame edges. */
  glow?: number;
  /** Turns the hull semi-transparent and shifts the HUD tint. */
  cloaked?: boolean;
}

/** A cockpit hull: dark panels with seams and an engine glow along the edges. The frame art is decorative. */
export const CockpitFrame = forwardRef<HTMLDivElement, CockpitFrameProps>(function CockpitFrame(
  { glow = 0.5, cloaked, className, style, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={['docs-cockpit', className].filter(Boolean).join(' ')}
      data-cloaked={cloaked || undefined}
      style={{ '--cockpit-glow': Math.max(0, Math.min(1, glow)), ...style } as CSSProperties}
      {...rest}
    >
      <span className="docs-cockpit__seams" aria-hidden="true" />
      <span className="docs-cockpit__glow" aria-hidden="true" />
      <div className="docs-cockpit__body">{children}</div>
    </div>
  );
});
