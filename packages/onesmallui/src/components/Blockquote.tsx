import { forwardRef, type BlockquoteHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export interface BlockquoteProps extends BlockquoteHTMLAttributes<HTMLQuoteElement> {
  /** Who said it, shown under the quote ("— Ada Lovelace"). Wraps the quote in a <figure>. */
  source?: ReactNode;
  /** The work it comes from, rendered in <cite>. */
  sourceTitle?: ReactNode;
  /** Text alignment. Centered and end-aligned quotes drop the leading rule unless `variant` says otherwise. */
  align?: 'start' | 'center' | 'end';
  /** `'plain'` removes the leading rule. */
  variant?: 'default' | 'plain';
}

/** A quotation with an optional, correctly marked-up source (figure › blockquote + figcaption › cite). */
export const Blockquote = forwardRef<HTMLQuoteElement, BlockquoteProps>(function Blockquote(
  { source, sourceTitle, align = 'start', variant, className, children, ...rest },
  ref,
) {
  const plain = variant === 'plain' || (variant === undefined && align !== 'start');
  const alignClass = align === 'start' ? undefined : cls(`text-${align}`);
  const hasSource = Boolean(source || sourceTitle);
  const quote = (
    <blockquote
      ref={ref}
      className={cx(cls('blockquote'), !hasSource && alignClass, !hasSource && className)}
      data-variant={plain ? 'plain' : undefined}
      {...rest}
    >
      {children}
    </blockquote>
  );
  if (!hasSource) return quote;
  return (
    <figure className={cx(alignClass, className)}>
      {quote}
      <figcaption className={cls('blockquote-footer')}>
        {source}
        {source && sourceTitle ? ', ' : null}
        {sourceTitle && <cite>{sourceTitle}</cite>}
      </figcaption>
    </figure>
  );
});
