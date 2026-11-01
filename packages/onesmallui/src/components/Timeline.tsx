import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useAnnouncer } from '../hooks/useAnnouncer';
import { useControllableState } from '../hooks/useControllableState';
import { ClockIcon } from '../icons/ClockIcon';
import { ErrorIcon } from '../icons/ErrorIcon';
import { InfoIcon } from '../icons/InfoIcon';
import { SuccessIcon } from '../icons/SuccessIcon';
import { WarningIcon } from '../icons/WarningIcon';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Tooltip } from './Tooltip';
import { VisuallyHidden } from './VisuallyHidden';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';

export type TimelineStatus = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'pending';
export type TimelineLayout = 'vertical' | 'alternating' | 'horizontal';
export type TimelineVariant = 'default' | 'feed';
export type TimelineStatusLabels = Record<Exclude<TimelineStatus, 'default'>, string>;

const defaultStatusLabels: TimelineStatusLabels = {
  success: 'Success',
  warning: 'Warning',
  danger: 'Error',
  info: 'Info',
  pending: 'Pending',
};

const statusIcons: Record<Exclude<TimelineStatus, 'default'>, ReactNode> = {
  success: <SuccessIcon />,
  warning: <WarningIcon />,
  danger: <ErrorIcon />,
  info: <InfoIcon />,
  pending: <ClockIcon />,
};

// ---------- Dates ----------

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parses a timeline `time`. A date-only string ("2026-10-01") is a calendar day, not an
 * instant, so it becomes UTC midnight and is formatted in UTC: it never shows as the day
 * before in timezones west of Greenwich.
 */
function parseTime(time: Date | string): { date: Date; dateOnly: boolean; iso: string } | null {
  if (time instanceof Date) return Number.isNaN(time.getTime()) ? null : { date: time, dateOnly: false, iso: time.toISOString() };
  const m = DATE_ONLY.exec(time);
  const date = m ? new Date(Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!)) : new Date(time);
  return Number.isNaN(date.getTime()) ? null : { date, dateOnly: !!m, iso: time };
}

const formatters = new Map<string, Intl.DateTimeFormat | Intl.RelativeTimeFormat>();
function cached<T extends Intl.DateTimeFormat | Intl.RelativeTimeFormat>(key: string, make: () => T): T {
  let f = formatters.get(key) as T | undefined;
  if (!f) formatters.set(key, (f = make()));
  return f;
}

function formatDate(date: Date, dateOnly: boolean, locale: string | undefined, timeZone: string | undefined, options: Intl.DateTimeFormatOptions) {
  const opts: Intl.DateTimeFormatOptions = { ...options, timeZone: dateOnly ? 'UTC' : timeZone };
  if (dateOnly) {
    // A calendar day has no time of day to show.
    delete opts.timeStyle;
    delete opts.hour;
    delete opts.minute;
    delete opts.second;
  }
  return cached(`d|${locale}|${JSON.stringify(opts)}`, () => new Intl.DateTimeFormat(locale, opts)).format(date);
}

const relativeUnits: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

/**
 * "5 minutes ago", "yesterday", "in 2 weeks", with `Intl.RelativeTimeFormat` in the largest
 * unit that fits. Anything under 45 seconds away is "now".
 */
function formatRelativeTime(date: Date | number, now: Date | number, locale?: string): string {
  const rtf = cached(`r|${locale}`, () => new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }));
  const seconds = (+date - +now) / 1000;
  if (Math.abs(seconds) < 45) return rtf.format(0, 'second');
  for (const [unit, size] of relativeUnits) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(Math.round(seconds / 60), 'minute');
}

// A shared clock for feed timelines: one 30 second interval for every mounted feed. The server
// (and the hydration pass) snapshot is null, which renders the absolute date, so markup matches.
let clock = 0;
let clockTimer: ReturnType<typeof setInterval> | undefined;
const clockListeners = new Set<() => void>();
function subscribeClock(listener: () => void) {
  if (!clockListeners.size) clock = Date.now();
  clockListeners.add(listener);
  clockTimer ??= setInterval(() => {
    clock = Date.now();
    clockListeners.forEach((l) => l());
  }, 30_000);
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size) return;
    clearInterval(clockTimer);
    clockTimer = undefined;
    clock = 0;
  };
}
const getClock = () => (clock ||= Date.now());
const getServerClock = () => null;
const noopSubscribe = () => () => {};

// ---------- Timeline ----------

interface TimelineContextValue {
  variant: TimelineVariant;
  layout: TimelineLayout;
  statusLabels: TimelineStatusLabels;
  locale?: string;
  timeZone?: string;
  dateFormat: Intl.DateTimeFormatOptions;
  /** Feed only: the time relative text is measured from, or null to show absolute dates. */
  now: number | null;
  focusable: boolean;
}
const TimelineContext = createContext<TimelineContextValue | null>(null);

export interface TimelineProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** `alternating` puts items on both sides of the line (one side in narrow containers); `horizontal` scrolls sideways when it overflows. */
  layout?: TimelineLayout;
  /** `feed`: an activity log with avatars, actors and relative times. */
  variant?: TimelineVariant;
  /** Shows this many items, then a "Show more" button that reveals the next batch. */
  pageSize?: number;
  /** How many items are shown (with `pageSize`). Controlled. */
  visibleCount?: number;
  /** Initial number of items shown. Defaults to `pageSize`. */
  defaultVisibleCount?: number;
  onVisibleCountChange?: (count: number) => void;
  /** Locale for dates and relative times. Pass it when server rendering so server and client agree. */
  locale?: string;
  /** IANA time zone for dates, e.g. `'Europe/London'`. Pass it when server rendering. */
  timeZone?: string;
  /** `Intl.DateTimeFormat` options for item dates. Default `{ dateStyle: 'medium', timeStyle: 'short' }`. */
  dateFormat?: Intl.DateTimeFormatOptions;
  /**
   * Feed: the time relative times are measured from. Without it the server renders absolute
   * dates and relative text switches in after hydration, updating every 30 seconds.
   */
  now?: Date | number;
  /** Screen reader text for each status, for translation. */
  statusLabels?: Partial<TimelineStatusLabels>;
  /** Text of the "Show more" button. */
  showMoreLabel?: ReactNode;
  /** Announcement after "Show more". Default `"5 more events shown"`. */
  moreShownLabel?: (count: number) => string;
  /** Names the list (and the scroll region, when a horizontal timeline overflows). */
  'aria-label'?: string;
  /** `TimelineItem`s. */
  children?: ReactNode;
}

/**
 * Events in order, on an ordered list. Each item has a status icon (plus hidden text), title,
 * `<time>`, description and actions. Vertical, alternating or horizontal; optional paging
 * with "Show more"; `variant="feed"` for activity logs.
 */
export const Timeline = forwardRef<HTMLDivElement, TimelineProps>(function Timeline(
  {
    layout = 'vertical',
    variant = 'default',
    pageSize,
    visibleCount,
    defaultVisibleCount,
    onVisibleCountChange,
    locale,
    timeZone,
    dateFormat = { dateStyle: 'medium', timeStyle: 'short' },
    now: nowProp,
    statusLabels,
    showMoreLabel = 'Show more',
    moreShownLabel = (n) => `${n} more ${n === 1 ? 'event' : 'events'} shown`,
    className,
    children,
    'aria-label': ariaLabel = 'Timeline',
    'aria-labelledby': labelledBy,
    ...rest
  },
  ref,
) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement[];
  const paged = pageSize !== undefined && pageSize > 0;
  const [countState, setCount] = useControllableState(visibleCount, defaultVisibleCount ?? pageSize ?? items.length, onVisibleCountChange);
  const count = paged ? Math.min(Math.max(countState, 0), items.length) : items.length;
  const { announce } = useAnnouncer();
  const listRef = useRef<HTMLOListElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const focusIndex = useRef<{ index: number; expect: number } | null>(null);
  const [overflowing, setOverflowing] = useState(false);

  const live = variant === 'feed' && nowProp === undefined;
  const clientNow = useSyncExternalStore(live ? subscribeClock : noopSubscribe, live ? getClock : getServerClock, getServerClock);
  const now = variant !== 'feed' ? null : nowProp !== undefined ? +nowProp : clientNow;

  // A scrolling timeline must be reachable by keyboard (WCAG 2.1.1); only add the tab stop when it scrolls.
  useIsomorphicLayoutEffect(() => {
    const el = viewport.current;
    if (!el || layout !== 'horizontal') return;
    const check = () => setOverflowing(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [layout, count]);

  // After "Show more", focus the first new item so keyboard and screen reader users land on it.
  // Only when the count became what the click asked for (a controlled parent may refuse it).
  useEffect(() => {
    const pending = focusIndex.current;
    if (!pending) return;
    focusIndex.current = null;
    if (count === pending.expect) (listRef.current?.children[pending.index] as HTMLElement | undefined)?.focus();
  });

  const showMore = () => {
    const next = Math.min(count + pageSize!, items.length);
    focusIndex.current = { index: count, expect: next };
    setCount(next);
    announce(moreShownLabel(next - count));
  };

  const scrollRegion = layout === 'horizontal' && overflowing;
  return (
    <TimelineContext.Provider
      value={{
        variant,
        layout,
        statusLabels: { ...defaultStatusLabels, ...statusLabels },
        locale,
        timeZone,
        dateFormat,
        now,
        focusable: paged,
      }}
    >
      <div ref={ref} className={cx(cls('timeline'), className)} data-layout={layout} data-variant={variant} {...rest}>
        <div
          ref={viewport}
          className={cls('timeline__viewport')}
          tabIndex={scrollRegion ? 0 : undefined}
          role={scrollRegion ? 'region' : undefined}
          aria-label={scrollRegion && !labelledBy ? ariaLabel : undefined}
          aria-labelledby={scrollRegion ? labelledBy : undefined}
        >
          <ol ref={listRef} className={cls('timeline__list')} aria-label={labelledBy ? undefined : ariaLabel} aria-labelledby={labelledBy}>
            {items.slice(0, count)}
          </ol>
        </div>
        {paged && count < items.length && (
          <div className={cls('timeline__more')}>
            <Button variant="soft" color="neutral" onClick={showMore}>
              {showMoreLabel}
            </Button>
          </div>
        )}
      </div>
    </TimelineContext.Provider>
  );
});

export interface TimelineItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'title'> {
  /** What happened. In a feed, `actor` and `action` take its place. */
  title?: ReactNode;
  /** When it happened: a `Date` or an ISO 8601 string. Rendered in `<time dateTime>`. */
  time?: Date | string;
  /** Replaces the formatted date text (the `dateTime` attribute still comes from `time`). */
  timeLabel?: ReactNode;
  description?: ReactNode;
  /** Status icon and screen reader prefix ("Success:"). Default `'default'`: a plain dot. */
  status?: TimelineStatus;
  /** Replaces the status icon in the marker: another icon, or an `Avatar`. Decorative. */
  marker?: ReactNode;
  /** Buttons or links under the content. */
  actions?: ReactNode;
  /** Feed: who did it. Also the avatar's initials. */
  actor?: string;
  /** Feed: the actor's picture. */
  avatarSrc?: string;
  /** Feed: what they did, after the actor ("commented on Launch plan"). */
  action?: ReactNode;
}

/** One event in a `Timeline`. Extra children render under the description. */
export const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(function TimelineItem(
  { title, time, timeLabel, description, status = 'default', marker, actions, actor, avatarSrc, action, className, children, ...rest },
  ref,
) {
  const ctx = useContext(TimelineContext);
  if (!ctx) throw new Error('<TimelineItem> must be inside <Timeline>.');
  const feed = ctx.variant === 'feed';
  const icon = status === 'default' ? null : statusIcons[status];
  const statusText = status === 'default' ? null : ctx.statusLabels[status];

  let markerContent: ReactNode = marker ?? icon;
  if (feed && marker === undefined && actor) {
    markerContent = (
      <>
        <Avatar name={actor} src={avatarSrc} />
        {icon && <span className={cls('timeline__badge')}>{icon}</span>}
      </>
    );
  }

  const parsed = time === undefined ? null : parseTime(time);
  let timeEl: ReactNode = null;
  if (time !== undefined) {
    const full = parsed && formatDate(parsed.date, parsed.dateOnly, ctx.locale, ctx.timeZone, feed ? { dateStyle: 'full', timeStyle: 'short' } : ctx.dateFormat);
    const relative = parsed && feed && ctx.now !== null ? formatRelativeTime(parsed.date, ctx.now, ctx.locale) : null;
    // A tooltip trigger must be focusable so keyboard users can reach the full date (WCAG 2.1.1, 1.4.13).
    const tabStop = relative ? 0 : undefined;
    timeEl = (
      <time className={cls('timeline__time')} dateTime={parsed?.iso ?? time.toString()} tabIndex={tabStop}>
        {timeLabel ?? relative ?? full ?? time.toString()}
      </time>
    );
    // The relative text is short; the full date is a focusable tooltip away (and its description).
    if (relative && full) timeEl = <Tooltip content={full}>{timeEl as ReactElement<Record<string, unknown>>}</Tooltip>;
  }

  const heading = feed && (actor || action) ? (
    <>
      {actor && <span className={cls('timeline__actor')}>{actor}</span>}
      {actor && action ? ' ' : null}
      {action}
    </>
  ) : (
    title
  );

  return (
    <li
      ref={ref}
      className={cx(cls('timeline__item'), className)}
      data-status={status}
      tabIndex={ctx.focusable ? -1 : undefined}
      {...rest}
    >
      <span className={cls('timeline__marker')} aria-hidden="true">
        {markerContent}
      </span>
      <div className={cls('timeline__body')}>
        <div className={cls('timeline__header')}>
          <div className={cls('timeline__title')}>
            {statusText && <VisuallyHidden>{statusText}: </VisuallyHidden>}
            {heading}
          </div>
          {timeEl}
        </div>
        {description && <div className={cls('timeline__description')}>{description}</div>}
        {children && <div className={cls('timeline__content')}>{children}</div>}
        {actions && <div className={cls('timeline__actions')}>{actions}</div>}
      </div>
    </li>
  );
});
