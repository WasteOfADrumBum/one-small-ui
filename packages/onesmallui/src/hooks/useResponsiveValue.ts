import { breakpoints, useMediaQuery } from './useMediaQuery';

export type ResponsiveKey = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
/** A value, or a value per breakpoint (mobile first): `{ base: 'bottom', lg: 'right' }`. */
export type ResponsiveValue<T> = T | Partial<Record<ResponsiveKey, T>>;

const isMap = <T,>(v: ResponsiveValue<T>): v is Partial<Record<ResponsiveKey, T>> =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && Object.keys(v).some((k) => k === 'base' || k in breakpoints);

/** Resolves a responsive prop to the value for the current viewport width. */
export function useResponsiveValue<T>(value: ResponsiveValue<T>): T {
  const sm = useMediaQuery(`(min-width: ${breakpoints.sm}px)`);
  const md = useMediaQuery(`(min-width: ${breakpoints.md}px)`);
  const lg = useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
  const xl = useMediaQuery(`(min-width: ${breakpoints.xl}px)`);
  const xxl = useMediaQuery(`(min-width: ${breakpoints['2xl']}px)`);
  if (!isMap(value)) return value;
  const active: [ResponsiveKey, boolean][] = [
    ['2xl', xxl],
    ['xl', xl],
    ['lg', lg],
    ['md', md],
    ['sm', sm],
    ['base', true],
  ];
  for (const [key, on] of active) if (on && value[key] !== undefined) return value[key] as T;
  // Nothing at or below the current width: use the smallest value given.
  for (const key of ['base', 'sm', 'md', 'lg', 'xl', '2xl'] as ResponsiveKey[]) if (value[key] !== undefined) return value[key] as T;
  return undefined as T;
}
