import { Children, createContext, forwardRef, useContext, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { ThemeColor } from './types';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const AvatarGroupContext = createContext<{ size?: AvatarSize } | null>(null);

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Person or entity name. Used for alt text and initials fallback. */
  name: string;
  src?: string;
  /** Defaults to the group's size, or `md`. */
  size?: AvatarSize;
  status?: 'online' | 'away' | 'busy' | 'offline';
  shape?: 'circle' | 'square';
  /** Background and text color for the initials. Omit for the default gradient. */
  color?: ThemeColor;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');

/** A picture or initials for a person, with an optional presence indicator. */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, src, size, status, shape = 'circle', color, className, ...rest },
  ref,
) {
  const group = useContext(AvatarGroupContext);
  const [failed, setFailed] = useState(false);
  const label = status ? `${name} (${status})` : name;
  return (
    <span
      ref={ref}
      role="img"
      aria-label={label}
      className={cx(cls('avatar'), className)}
      data-size={size ?? group?.size ?? 'md'}
      data-shape={shape}
      data-color={color}
      {...rest}
    >
      {src && !failed ? (
        <img src={src} alt="" onError={() => setFailed(true)} className={cls('avatar__img')} />
      ) : (
        <span className={cls('avatar__initials')} aria-hidden="true">
          {initials(name)}
        </span>
      )}
      {status && <span className={cls('avatar__status')} data-status={status} aria-hidden="true" />}
    </span>
  );
});

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Size for every avatar in the stack (each avatar can still override). */
  size?: AvatarSize;
  /** Show at most this many avatars, then a "+N" counter. */
  max?: number;
  /** Total people when you only pass some avatars (for example a paged list). Defaults to the number of children. */
  total?: number;
  /** How much avatars overlap. */
  spacing?: 'tight' | 'normal' | 'loose';
  /** Accessible name for the group. */
  label?: string;
  /** Accessible name for the overflow counter. */
  overflowLabel?: (hidden: number) => string;
  /** Rendered instead of the default "+N" text. */
  renderOverflow?: (hidden: number) => ReactNode;
}

/** Overlapping stack of avatars with an optional "+N" overflow counter. */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  {
    size = 'md',
    max,
    total,
    spacing = 'normal',
    label = 'People',
    overflowLabel = (n) => `${n} more`,
    renderOverflow,
    className,
    children,
    ...rest
  },
  ref,
) {
  const items = Children.toArray(children);
  const shown = max !== undefined ? items.slice(0, max) : items;
  const hidden = (total ?? items.length) - shown.length;
  return (
    <AvatarGroupContext.Provider value={{ size }}>
      <div
        ref={ref}
        role="group"
        aria-label={label}
        className={cx(cls('avatar-group'), className)}
        data-size={size}
        data-spacing={spacing}
        {...rest}
      >
        {shown}
        {hidden > 0 && (
          <span role="img" aria-label={overflowLabel(hidden)} className={cls('avatar')} data-size={size} data-overflow="">
            <span className={cls('avatar__initials')} aria-hidden="true">
              {renderOverflow ? renderOverflow(hidden) : `+${hidden}`}
            </span>
          </span>
        )}
      </div>
    </AvatarGroupContext.Provider>
  );
});
