import { forwardRef, useId, type ButtonHTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { useTheme } from './ThemeProvider';

export interface ThemeToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Accessible label. Defaults to "Switch to dark theme" / "Switch to light theme". */
  label?: string;
}

/** An animated sun/moon button that flips between light and dark. */
export const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(function ThemeToggle(
  { className, label, onClick, ...rest },
  ref,
) {
  const { resolvedTheme, toggle } = useTheme();
  const next = resolvedTheme === 'dark' ? 'light' : 'dark';
  const maskId = `${useId().replace(/:/g, '')}-mask`;
  return (
    <button
      ref={ref}
      type="button"
      className={cx(cls('theme-toggle'), className)}
      data-theme={resolvedTheme}
      aria-label={label ?? `Switch to ${next} theme`}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) toggle();
      }}
      {...rest}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <mask id={maskId}>
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <circle className={cls('theme-toggle__mask')} cx="24" cy="10" r="7" fill="black" />
        </mask>
        <circle className={cls('theme-toggle__core')} cx="12" cy="12" r="5" mask={`url(#${maskId})`} />
        <g className={cls('theme-toggle__rays')}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line key={deg} x1="12" y1="1.5" x2="12" y2="4" transform={`rotate(${deg} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
  );
});
