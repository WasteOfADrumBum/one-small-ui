import { forwardRef, useState, type HTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Person or entity name. Used for alt text and initials fallback. */
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'away' | 'busy' | 'offline';
  shape?: 'circle' | 'square';
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
  { name, src, size = 'md', status, shape = 'circle', className, ...rest },
  ref,
) {
  const [failed, setFailed] = useState(false);
  const label = status ? `${name} (${status})` : name;
  return (
    <span
      ref={ref}
      role="img"
      aria-label={label}
      className={cx(cls('avatar'), className)}
      data-size={size}
      data-shape={shape}
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
