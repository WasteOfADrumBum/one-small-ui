import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { PREFIX } from '../utils/prefix';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  /** What the user picked. */
  mode: ThemeMode;
  /** What is actually showing after resolving `system`. */
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  /** Flips between light and dark. */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const THEME_ATTRIBUTE = `data-${PREFIX}-theme`;
const DEFAULT_STORAGE_KEY = 'onesmallui-theme';

export interface ThemeProviderProps {
  children: ReactNode;
  /** Starting mode when nothing is stored. Defaults to `system`. */
  defaultMode?: ThemeMode;
  /** Controlled mode. */
  mode?: ThemeMode;
  onModeChange?: (mode: ThemeMode) => void;
  /** localStorage key used to remember the choice. Pass `false` to disable persistence. */
  storageKey?: string | false;
  /** Element that receives the `data-os-theme` attribute. Defaults to `<html>`. */
  target?: () => HTMLElement | null;
}

function readStored(key: string | false): ThemeMode | null {
  if (!key || typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(key);
    return v === 'light' || v === 'dark' || v === 'system' ? v : null;
  } catch {
    return null;
  }
}

/**
 * Provides light/dark/system theming. Sets `data-os-theme` on `<html>` so every
 * token switches with zero re-renders of your components.
 */
export function ThemeProvider({
  children,
  defaultMode = 'system',
  mode: controlledMode,
  onModeChange,
  storageKey = DEFAULT_STORAGE_KEY,
  target,
}: ThemeProviderProps) {
  const [uncontrolled, setUncontrolled] = useState<ThemeMode>(() => readStored(storageKey) ?? defaultMode);
  const mode = controlledMode ?? uncontrolled;
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const resolvedTheme: ResolvedTheme = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

  useEffect(() => {
    const el = target ? target() : document.documentElement;
    if (!el) return;
    el.setAttribute(THEME_ATTRIBUTE, resolvedTheme);
  }, [resolvedTheme, target]);

  const setMode = useCallback(
    (next: ThemeMode) => {
      if (controlledMode === undefined) setUncontrolled(next);
      if (storageKey) {
        try {
          window.localStorage.setItem(storageKey, next);
        } catch {
          /* storage unavailable (private mode); the choice still applies for this visit */
        }
      }
      onModeChange?.(next);
    },
    [controlledMode, onModeChange, storageKey],
  );

  const toggle = useCallback(() => setMode(resolvedTheme === 'dark' ? 'light' : 'dark'), [resolvedTheme, setMode]);

  const value = useMemo(() => ({ mode, resolvedTheme, setMode, toggle }), [mode, resolvedTheme, setMode, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Reads and changes the current theme. Must be used inside `<ThemeProvider>`. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>.');
  return ctx;
}

/**
 * Inline this in `<head>` (before your CSS paints) to apply the stored theme
 * immediately and avoid a flash of the wrong theme on load.
 */
export const themeInitScript = (storageKey: string = DEFAULT_STORAGE_KEY): string =>
  `(function(){try{var m=localStorage.getItem(${JSON.stringify(storageKey)})||'system';` +
  `var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);` +
  `document.documentElement.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)},d?'dark':'light')}catch(e){}})();`;
