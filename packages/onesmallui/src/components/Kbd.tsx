import { forwardRef, useSyncExternalStore, type HTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { formatHotkey, isApplePlatform, type HotkeyPlatform } from '../utils/hotkeys';
import { cls } from '../utils/prefix';
import type { Size } from './types';

const noop = () => () => {};

/**
 * The platform for display. The server and the hydration pass render `'other'`, then
 * the client switches to the detected platform, so markup never mismatches.
 */
export function useHotkeyPlatform(platform: 'auto' | HotkeyPlatform = 'auto'): HotkeyPlatform {
  const detected = useSyncExternalStore<HotkeyPlatform>(
    noop,
    () => (isApplePlatform() ? 'mac' : 'other'),
    () => 'other',
  );
  return platform === 'auto' ? detected : platform;
}

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /**
   * A key combo such as `'Mod+K'` or `'Shift+?'`. `Mod` shows ⌘ on Apple platforms and
   * Ctrl elsewhere, and screen readers hear the keys spelled out ("Control K").
   * Without `combo`, the children are shown as a single key.
   */
  combo?: string;
  size?: Size;
  /** Force a platform's labels. Default `'auto'` (detected after hydration). */
  platform?: 'auto' | HotkeyPlatform;
}

/** A keyboard key or shortcut, on the semantic `<kbd>` element. */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { combo, size = 'md', platform = 'auto', className, children, ...rest },
  ref,
) {
  const resolved = useHotkeyPlatform(platform);
  const shared = { ref, className: cx(cls('kbd'), className), 'data-size': size, ...rest };
  if (!combo) return <kbd {...shared}>{children}</kbd>;
  const { keys, spoken } = formatHotkey(combo, resolved);
  return (
    <kbd {...shared} data-platform={resolved}>
      <span className={cls('kbd__keys')} aria-hidden="true">
        {keys.map((k, i) => (
          <kbd key={i} className={cls('kbd__key')}>
            {k}
          </kbd>
        ))}
      </span>
      <span className={cls('sr-only')}>{spoken}</span>
    </kbd>
  );
});
