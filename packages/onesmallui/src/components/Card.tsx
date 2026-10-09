import { forwardRef, type HTMLAttributes, type ElementType } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export type CardVariant = 'surface' | 'glass' | 'outline' | 'elevated';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  /** Lifts and glows on hover. Use for clickable cards. */
  interactive?: boolean;
  /** Animated light sweep along the top edge. */
  glow?: boolean;
  /** Element to render. Use `article` or `section` for standalone content. */
  as?: ElementType;
}

/** A container for related content, with optional header, body, media and footer. */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { variant = 'surface', interactive, glow, as: Tag = 'div', className, ...rest },
  ref,
) {
  return (
    <Tag
      ref={ref}
      className={cx(cls('card'), className)}
      data-variant={variant}
      data-interactive={interactive || undefined}
      data-glow={glow || undefined}
      {...rest}
    />
  );
});

const part = (name: string, Default: ElementType) =>
  forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & { as?: ElementType }>(function CardPart(
    { as: Tag = Default, className, ...rest },
    ref,
  ) {
    return <Tag ref={ref} className={cx(cls(`card__${name}`), className)} {...rest} />;
  });

export const CardHeader = part('header', 'header');
export const CardBody = part('body', 'div');
export const CardFooter = part('footer', 'footer');
export const CardMedia = part('media', 'div');
