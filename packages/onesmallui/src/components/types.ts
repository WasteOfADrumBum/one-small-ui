export type Size = 'sm' | 'md' | 'lg';
/** Sizes for controls that also come in an extra-small step. */
export type ExtendedSize = 'xs' | Size;
/** Every themed color role. Each has `--os-<c>`, `-hover`, `on-<c>`, `-soft` and `-text` tokens. */
export type ThemeColor = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'inverse';
/** Kept for components typed before `ThemeColor` existed; now the same set. */
export type StatusColor = ThemeColor;
/** A theme color, or `neutral` (surface-toned, low emphasis). */
export type Color = ThemeColor | 'neutral';
/** Logical placement for anything anchored to a trigger. `start`/`end` follow the text direction. */
export type Side = 'top' | 'bottom' | 'left' | 'right';
export type Placement = Side | `${Side}-start` | `${Side}-end`;
