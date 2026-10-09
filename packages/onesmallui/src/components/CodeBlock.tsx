import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  code: string;
  language?: string;
  /** File name or caption shown in the header. */
  title?: ReactNode;
  /** Plug in a syntax highlighter (Prism, Shiki, ...). Receives the raw code. */
  renderCode?: (code: string, language?: string) => ReactNode;
  showLineNumbers?: boolean;
  /** Hide the copy button. */
  noCopy?: boolean;
}

/** A code panel with a one-click copy button that confirms to screen readers. */
export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock(
  { code, language, title, renderCode, showLineNumbers, noCopy, className, ...rest },
  ref,
) {
  const { copy, copied } = useCopyToClipboard();
  const trimmed = code.replace(/\n+$/, '');
  return (
    <div ref={ref} className={cx(cls('code'), className)} data-line-numbers={showLineNumbers || undefined} {...rest}>
      <div className={cls('code__header')}>
        <span className={cls('code__title')}>{title ?? language ?? 'code'}</span>
        {!noCopy && (
          <button
            type="button"
            className={cls('code__copy')}
            data-copied={copied || undefined}
            onClick={() => copy(trimmed)}
            aria-label={copied ? 'Copied to clipboard' : `Copy ${language ?? ''} code`.replace('  ', ' ')}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {copied ? (
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              ) : (
                <>
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                </>
              )}
            </svg>
            <span aria-hidden="true">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
        <span className={cls('sr-only')} aria-live="polite">
          {copied ? 'Code copied to clipboard' : ''}
        </span>
      </div>
      <pre className={cls('code__pre')} tabIndex={0} aria-label={typeof title === 'string' ? title : language ? `${language} code` : 'Code'}>
        <code data-language={language}>{renderCode ? renderCode(trimmed, language) : trimmed}</code>
      </pre>
    </div>
  );
});
