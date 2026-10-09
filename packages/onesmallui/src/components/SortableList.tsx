import { useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export interface SortableRenderState {
  isDragging: boolean;
  index: number;
}

export interface SortableListProps<T> {
  items: T[];
  /** Stable unique key for each item. */
  getKey: (item: T) => string | number;
  /** Human-readable name for each item, used in announcements. */
  getItemLabel: (item: T) => string;
  onReorder: (items: T[], move: { from: number; to: number }) => void;
  renderItem: (item: T, state: SortableRenderState) => ReactNode;
  /** Accessible name for the list. */
  label: string;
  orientation?: 'vertical' | 'horizontal';
  /** Drag only from the grip handle (default) or anywhere on the item. */
  handle?: boolean;
  className?: string;
}

const move = <T,>(arr: T[], from: number, to: number) => {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
};

/**
 * A reorderable list. Drag with a mouse, pen or touch, or use the keyboard:
 * focus a handle, press Space to pick up, arrow keys to move, Space to drop,
 * Escape to cancel. Every move is announced to screen readers.
 */
export function SortableList<T>({
  items,
  getKey,
  getItemLabel,
  onReorder,
  renderItem,
  label,
  orientation = 'vertical',
  handle = true,
  className,
}: SortableListProps<T>) {
  const id = `os-sort-${useId().replace(/:/g, '')}`;
  const nodes = useRef(new Map<string | number, HTMLLIElement>());
  const [dragKey, setDragKey] = useState<string | number | null>(null);
  const [kbGrab, setKbGrab] = useState<{ key: string | number; origin: number; snapshot: T[] } | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const drag = useRef<{
    key: string | number;
    from: number;
    to: number;
    start: number;
    rects: DOMRect[];
    size: number;
    pointerId: number;
  } | null>(null);

  const horizontal = orientation === 'horizontal';
  const axis = (r: DOMRect) => (horizontal ? { start: r.left, size: r.width } : { start: r.top, size: r.height });
  const ordered = () => items.map((it) => nodes.current.get(getKey(it))).filter(Boolean) as HTMLLIElement[];
  const total = items.length;

  const focusHandle = (key: string | number) =>
    requestAnimationFrame(() =>
      nodes.current.get(key)?.querySelector<HTMLElement>(`[data-sortable-handle]`)?.focus(),
    );

  // ---- Pointer dragging -------------------------------------------------
  const onPointerDown = (e: PointerEvent<HTMLElement>, key: string | number, index: number) => {
    if (e.button !== 0 || kbGrab) return;
    const els = ordered();
    const rects = els.map((el) => el.getBoundingClientRect());
    const gap = rects.length > 1 ? axis(rects[1]!).start - (axis(rects[0]!).start + axis(rects[0]!).size) : 0;
    drag.current = {
      key,
      from: index,
      to: index,
      start: horizontal ? e.clientX : e.clientY,
      rects,
      size: axis(rects[index]!).size + Math.max(0, gap),
      pointerId: e.pointerId,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragKey(key);
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    e.preventDefault();
    const delta = (horizontal ? e.clientX : e.clientY) - d.start;
    const own = axis(d.rects[d.from]!);
    const center = own.start + own.size / 2 + delta;
    let to = d.from;
    d.rects.forEach((r, i) => {
      const { start, size } = axis(r);
      const mid = start + size / 2;
      if (i > d.from && center > mid) to = Math.max(to, i);
      if (i < d.from && center < mid) to = Math.min(to, i);
    });
    d.to = to;
    const els = ordered();
    els.forEach((el, i) => {
      if (i === d.from) {
        el.style.transform = horizontal ? `translateX(${delta}px)` : `translateY(${delta}px)`;
        return;
      }
      let shift = 0;
      if (d.from < to && i > d.from && i <= to) shift = -d.size;
      if (d.from > to && i < d.from && i >= to) shift = d.size;
      el.style.transform = shift ? (horizontal ? `translateX(${shift}px)` : `translateY(${shift}px)`) : '';
    });
  };

  const endDrag = (commit: boolean) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const els = ordered();
    const finish = () => {
      els.forEach((el) => {
        el.style.transition = 'none';
        el.style.transform = '';
      });
      requestAnimationFrame(() => els.forEach((el) => (el.style.transition = '')));
    };
    if (commit && d.to !== d.from) {
      const item = items[d.from]!;
      flushSync(() => {
        onReorder(move(items, d.from, d.to), { from: d.from, to: d.to });
        setDragKey(null);
      });
      finish();
      setAnnouncement(`${getItemLabel(item)} moved to position ${d.to + 1} of ${total}.`);
    } else {
      finish();
      setDragKey(null);
    }
  };

  // ---- Keyboard dragging ------------------------------------------------
  const onHandleKeyDown = (e: KeyboardEvent<HTMLElement>, item: T, index: number) => {
    const key = getKey(item);
    const name = getItemLabel(item);
    const prevKey = horizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = horizontal ? 'ArrowRight' : 'ArrowDown';

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!kbGrab) {
        setKbGrab({ key, origin: index, snapshot: items });
        setAnnouncement(
          `Picked up ${name}, position ${index + 1} of ${total}. Use ${horizontal ? 'left and right' : 'up and down'} arrow keys to move, Space to drop, Escape to cancel.`,
        );
      } else {
        setKbGrab(null);
        setAnnouncement(`${name} dropped at position ${index + 1} of ${total}.`);
      }
      return;
    }
    if (!kbGrab || kbGrab.key !== key) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      onReorder(kbGrab.snapshot, { from: index, to: kbGrab.origin });
      setKbGrab(null);
      setAnnouncement(`Reorder cancelled. ${name} returned to position ${kbGrab.origin + 1}.`);
      focusHandle(key);
      return;
    }
    let to = index;
    if (e.key === prevKey) to = Math.max(0, index - 1);
    else if (e.key === nextKey) to = Math.min(total - 1, index + 1);
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = total - 1;
    else return;
    e.preventDefault();
    if (to !== index) {
      onReorder(move(items, index, to), { from: index, to });
      setAnnouncement(`${name} moved to position ${to + 1} of ${total}.`);
      focusHandle(key);
    }
  };

  return (
    <>
      <p id={`${id}-help`} className={cls('sr-only')}>
        Press Space or Enter on a handle to pick up an item, arrow keys to move it, Space to drop, Escape to cancel.
      </p>
      <ul
        className={cx(cls('sortable'), className)}
        data-orientation={orientation}
        data-dragging={dragKey !== null || undefined}
        aria-label={label}
      >
        {items.map((item, index) => {
          const key = getKey(item);
          const isDragging = dragKey === key || kbGrab?.key === key;
          const pointerProps = {
            onPointerDown: (e: PointerEvent<HTMLElement>) => onPointerDown(e, key, index),
            onPointerMove,
            onPointerUp: () => endDrag(true),
            onPointerCancel: () => endDrag(false),
          };
          return (
            <li
              key={key}
              ref={(el) => {
                if (el) nodes.current.set(key, el);
                else nodes.current.delete(key);
              }}
              className={cls('sortable__item')}
              data-state={isDragging ? 'dragging' : undefined}
              {...(!handle ? pointerProps : {})}
            >
              <button
                type="button"
                className={cls('sortable__handle')}
                data-sortable-handle=""
                aria-label={`Reorder ${getItemLabel(item)}`}
                aria-describedby={`${id}-help`}
                aria-pressed={kbGrab?.key === key}
                onKeyDown={(e) => onHandleKeyDown(e, item, index)}
                {...(handle ? pointerProps : {})}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                  {[6, 12, 18].map((y) => (
                    <g key={y}>
                      <circle cx="9" cy={y} r="1.6" />
                      <circle cx="15" cy={y} r="1.6" />
                    </g>
                  ))}
                </svg>
              </button>
              <div className={cls('sortable__content')}>{renderItem(item, { isDragging, index })}</div>
            </li>
          );
        })}
      </ul>
      <div className={cls('sr-only')} aria-live="assertive" aria-atomic="true">
        {announcement}
      </div>
    </>
  );
}
