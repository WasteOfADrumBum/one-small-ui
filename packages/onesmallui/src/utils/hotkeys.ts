/** Keyboard combo helpers shared by `Kbd`, `useHotkeys`, CommandPalette and Menu shortcuts. */

export type HotkeyPlatform = 'mac' | 'other';

export interface ParsedHotkey {
  mod: boolean;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
  /** The main key, normalised: lower-case for characters (`'k'`), `KeyboardEvent.key` names otherwise (`'Enter'`). */
  key: string;
}

const MODIFIERS: Record<string, keyof Omit<ParsedHotkey, 'key'>> = {
  mod: 'mod',
  ctrl: 'ctrl',
  control: 'ctrl',
  meta: 'meta',
  cmd: 'meta',
  command: 'meta',
  alt: 'alt',
  option: 'alt',
  opt: 'alt',
  shift: 'shift',
};

/** Aliases accepted in combos, mapped to `KeyboardEvent.key` values. */
const KEY_ALIASES: Record<string, string> = {
  esc: 'Escape',
  escape: 'Escape',
  enter: 'Enter',
  return: 'Enter',
  tab: 'Tab',
  space: ' ',
  spacebar: ' ',
  backspace: 'Backspace',
  delete: 'Delete',
  del: 'Delete',
  insert: 'Insert',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  arrowup: 'ArrowUp',
  arrowdown: 'ArrowDown',
  arrowleft: 'ArrowLeft',
  arrowright: 'ArrowRight',
  home: 'Home',
  end: 'End',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  contextmenu: 'ContextMenu',
  plus: '+',
};

/**
 * Parses `'Mod+Shift+K'`, `'ctrl+alt+delete'` or `'?'` into its parts. Separator is `+`;
 * a literal plus is `'Plus'` or a trailing `'+'` (`'Ctrl++'`). Case-insensitive.
 */
export function parseHotkey(combo: string): ParsedHotkey {
  const out: ParsedHotkey = { mod: false, ctrl: false, meta: false, alt: false, shift: false, key: '' };
  const trimmed = combo.trim();
  const parts = trimmed.endsWith('++') ? [...trimmed.slice(0, -2).split('+'), '+'] : trimmed.split('+');
  for (const raw of parts) {
    const part = raw.trim();
    if (!part) continue;
    const lower = part.toLowerCase();
    const modifier = MODIFIERS[lower];
    if (modifier) out[modifier] = true;
    else if (KEY_ALIASES[lower]) out.key = KEY_ALIASES[lower]!;
    else if (/^f\d{1,2}$/.test(lower)) out.key = lower.toUpperCase();
    else out.key = part.length === 1 ? lower : part;
  }
  return out;
}

/** True on macOS, iOS and iPadOS. Always `false` on the server, so render the non-Apple form first. */
export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent || '';
  return /mac|iphone|ipad|ipod/i.test(platform);
}

const resolvePlatform = (platform?: HotkeyPlatform): HotkeyPlatform => platform ?? (isApplePlatform() ? 'mac' : 'other');

const CODE_FOR: Record<string, string> = { ' ': 'Space' };

/** The physical `KeyboardEvent.code` a character usually maps to, for layouts where Alt or Shift changes `key`. */
function codeFor(key: string): string | undefined {
  if (CODE_FOR[key]) return CODE_FOR[key];
  if (/^[a-z]$/.test(key)) return `Key${key.toUpperCase()}`;
  if (/^[0-9]$/.test(key)) return `Digit${key}`;
  return undefined;
}

/**
 * Whether a keyboard event matches a combo. `Mod` is ⌘ on Apple platforms and Ctrl
 * elsewhere. Modifiers must match exactly, except that Shift is ignored for
 * shifted characters such as `?` when the combo doesn't name Shift.
 */
export function matchesHotkey(
  event: Pick<KeyboardEvent, 'key' | 'code' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey'>,
  combo: string | ParsedHotkey,
  platform?: HotkeyPlatform,
): boolean {
  const hk = typeof combo === 'string' ? parseHotkey(combo) : combo;
  if (!hk.key) return false;
  const mac = resolvePlatform(platform) === 'mac';
  const wantCtrl = hk.ctrl || (hk.mod && !mac);
  const wantMeta = hk.meta || (hk.mod && mac);
  if (event.ctrlKey !== wantCtrl || event.metaKey !== wantMeta || event.altKey !== hk.alt) return false;
  const key = event.key?.length === 1 ? event.key.toLowerCase() : event.key;
  const symbol = hk.key.length === 1 && !/[a-z0-9 ]/.test(hk.key);
  if (event.shiftKey !== hk.shift && !(symbol && !hk.shift)) return false;
  if (key === hk.key) return true;
  // Alt (Option) and Shift change `key` on many layouts (Option+K is "˚" on a Mac); fall back to the physical key.
  const code = codeFor(hk.key);
  return !!code && event.code === code;
}

const MAC_SYMBOLS: Record<string, string> = { mod: '⌘', meta: '⌘', ctrl: '⌃', alt: '⌥', shift: '⇧' };
const OTHER_LABELS: Record<string, string> = { mod: 'Ctrl', meta: 'Win', ctrl: 'Ctrl', alt: 'Alt', shift: 'Shift' };
const SPOKEN_MOD: Record<HotkeyPlatform, Record<string, string>> = {
  mac: { mod: 'Command', meta: 'Command', ctrl: 'Control', alt: 'Option', shift: 'Shift' },
  other: { mod: 'Control', meta: 'Windows', ctrl: 'Control', alt: 'Alt', shift: 'Shift' },
};

const KEY_SYMBOLS: Record<string, [mac: string, other: string, spoken: string]> = {
  Enter: ['↵', 'Enter', 'Enter'],
  Escape: ['Esc', 'Esc', 'Escape'],
  Tab: ['⇥', 'Tab', 'Tab'],
  ' ': ['Space', 'Space', 'Space'],
  Backspace: ['⌫', 'Backspace', 'Backspace'],
  Delete: ['⌦', 'Del', 'Delete'],
  Insert: ['Ins', 'Ins', 'Insert'],
  ArrowUp: ['↑', '↑', 'Up arrow'],
  ArrowDown: ['↓', '↓', 'Down arrow'],
  ArrowLeft: ['←', '←', 'Left arrow'],
  ArrowRight: ['→', '→', 'Right arrow'],
  Home: ['Home', 'Home', 'Home'],
  End: ['End', 'End', 'End'],
  PageUp: ['PgUp', 'PgUp', 'Page up'],
  PageDown: ['PgDn', 'PgDn', 'Page down'],
  ContextMenu: ['Menu', 'Menu', 'Menu key'],
};

const SPOKEN_CHARS: Record<string, string> = {
  '+': 'Plus',
  '-': 'Minus',
  '=': 'Equals',
  '/': 'Slash',
  '\\': 'Backslash',
  '?': 'Question mark',
  '.': 'Period',
  ',': 'Comma',
  ';': 'Semicolon',
  "'": 'Apostrophe',
  '`': 'Backtick',
  '[': 'Left bracket',
  ']': 'Right bracket',
  '*': 'Asterisk',
};

export interface FormattedHotkey {
  /** One visual label per key, in order: `['⌘', 'K']` or `['Ctrl', 'K']`. */
  keys: string[];
  /** The combo spelled out for screen readers: `'Command K'`, `'Control Shift P'`. */
  spoken: string;
}

/** Formats a combo for display and for screen readers on the given (or detected) platform. */
export function formatHotkey(combo: string, platform?: HotkeyPlatform): FormattedHotkey {
  const hk = parseHotkey(combo);
  const p = resolvePlatform(platform);
  const order: (keyof Omit<ParsedHotkey, 'key'>)[] = p === 'mac' ? ['ctrl', 'alt', 'shift', 'mod', 'meta'] : ['mod', 'ctrl', 'meta', 'alt', 'shift'];
  const keys: string[] = [];
  const spoken: string[] = [];
  const seen = new Set<string>();
  for (const m of order) {
    if (!hk[m]) continue;
    const label = p === 'mac' ? MAC_SYMBOLS[m]! : OTHER_LABELS[m]!;
    if (seen.has(label)) continue;
    seen.add(label);
    keys.push(label);
    spoken.push(SPOKEN_MOD[p][m]!);
  }
  if (hk.key) {
    const sym = KEY_SYMBOLS[hk.key];
    if (sym) {
      keys.push(p === 'mac' ? sym[0] : sym[1]);
      spoken.push(sym[2]);
    } else {
      const label = hk.key.length === 1 ? hk.key.toUpperCase() : hk.key;
      keys.push(label);
      spoken.push(SPOKEN_CHARS[hk.key] ?? label);
    }
  }
  return { keys, spoken: spoken.join(' ') };
}

/** True when the event comes from a text field, select or contenteditable, where typing should win over hotkeys. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof (target as Element).closest !== 'function') return false;
  const el = target as HTMLElement;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag === 'INPUT') {
    const type = (el as HTMLInputElement).type;
    return !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file', 'image'].includes(type);
  }
  return !!el.closest('[contenteditable=""],[contenteditable="true"],[contenteditable="plaintext-only"]');
}
