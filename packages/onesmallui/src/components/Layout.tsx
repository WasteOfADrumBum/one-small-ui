import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

type SpaceKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
type BreakpointKey = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
/** A value, or a value per breakpoint: `{ base: 1, md: 2, lg: 3 }`. */
export type Responsive<T> = T | Partial<Record<BreakpointKey, T>>;

const space = (n: SpaceKey) => `${n * 0.25}rem`;

const ORDER: BreakpointKey[] = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];

/**
 * Turns a responsive prop into CSS variables: `--os-cols`, `--os-cols-md`, ...
 * Breakpoints you skip inherit the closest smaller one.
 */
function responsiveVars<T>(name: string, value: Responsive<T> | undefined, map: (v: T) => string): CSSProperties {
  const out: Record<string, string> = {};
  if (value === undefined) return out;
  // Always emit every breakpoint: custom properties inherit, so a nested grid
  // must never pick up its parent's per-breakpoint values.
  const byBp: Partial<Record<BreakpointKey, T>> =
    typeof value === 'object' && value !== null ? (value as Partial<Record<BreakpointKey, T>>) : { base: value as T };
  let last: T | undefined;
  for (const bp of ORDER) {
    if (byBp[bp] !== undefined) last = byBp[bp];
    if (last !== undefined) out[bp === 'base' ? `--os-${name}` : `--os-${name}-${bp}`] = map(last);
  }
  return out as CSSProperties;
}

interface PolymorphicProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

export interface ContainerProps extends PolymorphicProps {
  /**
   * Fixed max width, `'full'` for none, or `'responsive'` to step the max width at
   * every breakpoint (like `.os-container` / Bootstrap's `.container`).
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'responsive';
}

/** Centers content with a max width and responsive side padding. */
export const Container = forwardRef<HTMLElement, ContainerProps>(function Container(
  { as: Tag = 'div', size = 'xl', className, ...rest },
  ref,
) {
  return <Tag ref={ref} className={cx(cls('container'), className)} data-size={size} {...rest} />;
});

export interface StackProps extends PolymorphicProps {
  direction?: Responsive<'row' | 'column'>;
  gap?: Responsive<SpaceKey>;
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  wrap?: boolean;
}

/** Lays children out in a row or column with consistent spacing. */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  { as: Tag = 'div', direction = 'column', gap = 4, align, justify, wrap, className, style, ...rest },
  ref,
) {
  return (
    <Tag
      ref={ref}
      className={cx(cls('stack'), className)}
      data-wrap={wrap || undefined}
      style={{
        ...responsiveVars('stack-dir', direction, String),
        ...responsiveVars('stack-gap', gap, space),
        alignItems: align,
        justifyContent: justify,
        ...style,
      }}
      {...rest}
    />
  );
});

export interface GridProps extends PolymorphicProps {
  /** Column count, optionally per breakpoint. */
  columns?: Responsive<number>;
  /** Auto-fit columns at least this wide (overrides `columns`), e.g. "16rem". */
  minItemWidth?: string;
  gap?: Responsive<SpaceKey>;
}

/** A responsive CSS grid. */
export const Grid = forwardRef<HTMLElement, GridProps>(function Grid(
  { as: Tag = 'div', columns = 1, minItemWidth, gap = 4, className, style, ...rest },
  ref,
) {
  return (
    <Tag
      ref={ref}
      className={cx(cls('grid-layout'), className)}
      data-auto-fit={minItemWidth ? true : undefined}
      style={{
        ...responsiveVars('cols', columns, String),
        ...responsiveVars('grid-gap', gap, space),
        ...(minItemWidth ? ({ '--os-min-item': minItemWidth } as CSSProperties) : {}),
        ...style,
      }}
      {...rest}
    />
  );
});
