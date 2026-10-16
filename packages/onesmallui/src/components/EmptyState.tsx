import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { ErrorIcon } from '../icons/ErrorIcon';
import { InboxIcon } from '../icons/InboxIcon';
import { RefreshIcon } from '../icons/RefreshIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { Button } from './Button';

export type EmptyStatePreset = 'no-data' | 'no-results' | 'error' | 'first-use';
export type EmptyStateSize = 'default' | 'compact';

export interface EmptyStateLabels {
  /** The `no-results` preset's button, shown with `onClearFilters`. */
  clearFilters: string;
  /** The `error` preset's button, shown with `onRetry`. */
  retry: string;
}

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Fills in the icon, title and description (each still overridable). */
  preset?: EmptyStatePreset;
  /** Decorative icon above the title. Replaces the preset's icon; `false` hides it. */
  icon?: ReactNode | false;
  /** A larger decorative picture (an `<img alt="">` or SVG) shown instead of the icon. */
  illustration?: ReactNode;
  /** The heading. Defaults to the preset's. */
  title?: ReactNode;
  /** Heading element, to fit your page outline. Default 2. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Supporting text under the heading. Defaults to the preset's. */
  description?: ReactNode;
  /** The main action, such as a "Create project" Button. */
  actions?: ReactNode;
  /** Less important actions (a link to the docs), shown after the main ones. */
  secondaryActions?: ReactNode;
  /** `compact` for tables, menus, lists and other tight spaces. */
  size?: EmptyStateSize;
  /** With `preset="no-results"`, adds a "Clear filters" button that calls this. */
  onClearFilters?: () => void;
  /** With `preset="error"`, adds a "Try again" button that calls this. */
  onRetry?: () => void;
  /** Texts of the preset buttons, for translation. */
  labels?: Partial<EmptyStateLabels>;
}

const defaultLabels: EmptyStateLabels = { clearFilters: 'Clear filters', retry: 'Try again' };

const presets: Record<EmptyStatePreset, { icon: ReactNode; title: string; description: string }> = {
  'no-data': {
    icon: <InboxIcon />,
    title: 'No data yet',
    description: 'When there is something to show, it will appear here.',
  },
  'no-results': {
    icon: <SearchIcon />,
    title: 'No results found',
    description: 'Try different keywords, or clear the filters.',
  },
  error: {
    icon: <ErrorIcon />,
    title: 'Something went wrong',
    description: 'This could not be loaded. Check your connection and try again.',
  },
  'first-use': {
    icon: <SparklesIcon />,
    title: 'Nothing here yet',
    description: 'Get started by creating your first one.',
  },
};

/**
 * What to show when there is nothing to show: no data yet, no matches, a failed load or a
 * first visit. Presentational: a decorative icon, a heading, a description and actions.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  {
    preset,
    icon,
    illustration,
    title,
    headingLevel = 2,
    description,
    actions,
    secondaryActions,
    size = 'default',
    onClearFilters,
    onRetry,
    labels: labelsProp,
    className,
    children,
    ...rest
  },
  ref,
) {
  const labels = { ...defaultLabels, ...labelsProp };
  const defaults = preset ? presets[preset] : undefined;
  const H = `h${headingLevel}` as 'h2';
  const heading = title ?? defaults?.title;
  const text = description ?? defaults?.description;
  const media = illustration ?? (icon === false ? null : (icon ?? defaults?.icon));
  const btnSize = size === 'compact' ? 'sm' : undefined;

  // The preset's own button leads; it steps down to an outline when you pass a main action too.
  let presetAction: ReactNode = null;
  if (preset === 'no-results' && onClearFilters) {
    presetAction = (
      <Button size={btnSize} variant={actions ? 'outline' : undefined} onClick={onClearFilters}>
        {labels.clearFilters}
      </Button>
    );
  } else if (preset === 'error' && onRetry) {
    presetAction = (
      <Button size={btnSize} variant={actions ? 'outline' : undefined} leftIcon={<RefreshIcon />} onClick={onRetry}>
        {labels.retry}
      </Button>
    );
  }
  const hasActions = Boolean(presetAction || actions);

  return (
    <div
      ref={ref}
      className={cx(cls('empty-state'), className)}
      data-size={size === 'compact' ? 'compact' : undefined}
      data-preset={preset}
      {...rest}
    >
      {media != null && (
        <div className={cls('empty-state__media')} data-kind={illustration ? 'illustration' : 'icon'} aria-hidden="true">
          {media}
        </div>
      )}
      {heading != null && <H className={cls('empty-state__title')}>{heading}</H>}
      {text != null && <div className={cls('empty-state__description')}>{text}</div>}
      {children}
      {(hasActions || secondaryActions) && (
        <div className={cls('empty-state__actions')}>
          {hasActions && (
            <div className={cls('empty-state__primary')}>
              {presetAction}
              {actions}
            </div>
          )}
          {secondaryActions && <div className={cls('empty-state__secondary')}>{secondaryActions}</div>}
        </div>
      )}
    </div>
  );
});
