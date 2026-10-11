import {
  forwardRef,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ImgHTMLAttributes,
} from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { ThemeColor } from './types';

export type CardVariant = 'surface' | 'glass' | 'outline' | 'elevated' | 'solid';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /**
   * Background treatment. `glass` is translucent (frosted). With a `color`: `surface` tints
   * softly, `solid` fills with the color, `outline` colors the border, `glass` tints the glass.
   */
  variant?: CardVariant;
  /** Theme color. */
  color?: ThemeColor;
  /** `horizontal` places media beside the content from the `sm` breakpoint up. */
  orientation?: 'vertical' | 'horizontal';
  /** Lifts and glows on hover. Use for clickable cards. */
  interactive?: boolean;
  /** Animated light sweep along the top edge. */
  glow?: boolean;
  /** Element to render. Use `article` or `section` for standalone content. */
  as?: ElementType;
}

/** A container for related content, with optional header, body, media and footer. */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { variant = 'surface', color, orientation, interactive, glow, as: Tag = 'div', className, ...rest },
  ref,
) {
  return (
    <Tag
      ref={ref}
      className={cx(cls('card'), className)}
      data-variant={variant}
      data-color={color}
      data-orientation={orientation}
      data-interactive={interactive || undefined}
      data-glow={glow || undefined}
      {...rest}
    />
  );
});

type PartProps = HTMLAttributes<HTMLElement> & { as?: ElementType };
const part = (name: string, Default: ElementType) =>
  forwardRef<HTMLElement, PartProps>(function CardPart({ as: Tag = Default, className, ...rest }, ref) {
    return <Tag ref={ref} className={cx(cls(`card__${name}`), className)} {...rest} />;
  });

export const CardHeader = part('header', 'header');
export const CardBody = part('body', 'div');
export const CardFooter = part('footer', 'footer');
export const CardMedia = part('media', 'div');
/** Card heading. Defaults to `h3`; pick the level that fits your outline with `as`. */
export const CardTitle = part('title', 'h3');
export const CardSubtitle = part('subtitle', 'p');
export const CardText = part('text', 'p');

/** A link inside a card body. Several sit side by side. */
export const CardLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function CardLink(
  { className, ...rest },
  ref,
) {
  return <a ref={ref} className={cx(cls('card__link'), className)} {...rest} />;
});

export interface CardImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Rounds the matching corners. `cover` fills the card behind a `CardOverlay`. */
  position?: 'top' | 'bottom' | 'cover';
  /** Fixed aspect ratio, e.g. `16 / 9`. */
  ratio?: number;
}

/** An image at the top or bottom of a card, or behind an overlay. Always pass `alt` ("" if decorative). */
export const CardImage = forwardRef<HTMLImageElement, CardImageProps>(function CardImage(
  { position = 'top', ratio, className, style, alt, ...rest },
  ref,
) {
  return (
    <img
      ref={ref}
      alt={alt}
      className={cx(cls('card__img'), className)}
      data-position={position}
      style={ratio ? ({ aspectRatio: String(ratio), ...style } as CSSProperties) : style}
      {...rest}
    />
  );
});

export interface CardOverlayProps extends PartProps {
  /** Where the content sits over the image. */
  align?: 'start' | 'center' | 'end';
}

/**
 * Content laid over a `CardImage position="cover"`. A dark scrim keeps text at 7:1
 * whatever the photo, and the overlay is always rendered in the dark theme.
 */
export const CardOverlay = forwardRef<HTMLElement, CardOverlayProps>(function CardOverlay(
  { as: Tag = 'div', align = 'end', className, ...rest },
  ref,
) {
  return <Tag ref={ref} className={cx(cls('card__overlay'), className)} data-os-theme="dark" data-align={align} {...rest} />;
});

export interface CardGroupProps extends HTMLAttributes<HTMLElement> {
  /** `attached` joins cards edge to edge with equal heights (stacked on small screens); `grid` is a responsive auto-fill grid. */
  layout?: 'attached' | 'grid';
  /** Smallest card width in the `grid` layout. */
  minWidth?: string;
  as?: ElementType;
}

/** Lays out several cards as one attached group or as a responsive grid. */
export const CardGroup = forwardRef<HTMLElement, CardGroupProps>(function CardGroup(
  { layout = 'attached', minWidth, as: Tag = 'div', className, style, ...rest },
  ref,
) {
  return (
    <Tag
      ref={ref}
      className={cx(cls('card-group'), className)}
      data-layout={layout}
      style={minWidth ? ({ '--os-card-min': minWidth, ...style } as CSSProperties) : style}
      {...rest}
    />
  );
});
