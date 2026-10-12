import { forwardRef, type ForwardRefExoticComponent, type ReactNode, type RefAttributes, type SVGProps } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  /** `sm` 16px, `md` 20px, `lg` 24px (from `--os-icon-*`), or a number of pixels. */
  size?: 'sm' | 'md' | 'lg' | number;
  /**
   * Accessible name. Without it the icon is decorative and hidden from assistive tech;
   * with it the icon is exposed as an image (`role="img"`).
   */
  label?: string;
  /** Stroke width in viewBox units (the grid is 24×24). */
  strokeWidth?: number;
  /** The icon's shapes, drawn on a 24×24 grid. */
  children?: ReactNode;
}

/** The SVG wrapper every icon renders: a 24×24 stroked glyph that takes the text color. */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { size = 'md', label, strokeWidth = 2, className, style, children, ...rest },
  ref,
) {
  const numeric = typeof size === 'number';
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx(cls('icon'), className)}
      data-size={numeric ? undefined : size}
      style={numeric ? { width: size, height: size, ...style } : style}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true, focusable: false })}
      {...rest}
    >
      {children}
    </svg>
  );
});

/** Props an icon renders with unless the caller overrides them (`data-*` included). */
export type IconDefaults = Omit<IconProps, 'children'> & { [key: `data-${string}`]: string | undefined };

export type IconComponent = ForwardRefExoticComponent<Omit<IconProps, 'children'> & RefAttributes<SVGSVGElement>>;

/**
 * Builds a named icon component from its shapes. `createIcon('Star', <path d="…" />)`
 * returns `StarIcon`, which accepts every `Icon` prop and forwards its ref to the `<svg>`.
 */
export function createIcon(name: string, paths: ReactNode, defaults?: IconDefaults): IconComponent {
  const Component = forwardRef<SVGSVGElement, Omit<IconProps, 'children'>>(function NamedIcon(props, ref) {
    return (
      <Icon ref={ref} {...defaults} {...props}>
        {paths}
      </Icon>
    );
  });
  Component.displayName = `${name}Icon`;
  return Component;
}
