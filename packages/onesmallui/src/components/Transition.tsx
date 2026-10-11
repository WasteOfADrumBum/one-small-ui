import { cloneElement, isValidElement, useLayoutEffect, useRef, type CSSProperties, type ReactElement, type Ref } from 'react';
import { useMergedRefs } from '../hooks/useMergedRefs';
import { useTransition, type UseTransitionOptions } from '../hooks/useTransition';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export const transitionPresets = ['fade', 'scale', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'collapse'] as const;
export type TransitionPreset = (typeof transitionPresets)[number];

export interface TransitionProps extends UseTransitionOptions {
  /** Shown (`true`) or hidden. */
  show: boolean;
  /** Remove the child from the DOM once closed. Otherwise it stays, with `hidden`. */
  unmountOnExit?: boolean;
  /** A preset name, or your own class names added while opening. Default `'fade'`. */
  enter?: TransitionPreset | (string & {});
  /** A preset name, or your own class names added while closing. Defaults to `enter`. */
  leave?: TransitionPreset | (string & {});
  /** One element that accepts `className`, `style` and a ref. */
  children: ReactElement<Record<string, unknown>>;
}

const isPreset = (v: string | undefined): v is TransitionPreset => !!v && (transitionPresets as readonly string[]).includes(v);

/**
 * Animates one child in and out. The child gets `data-state="opening | open |
 * closing | closed"` (the same vocabulary as every overlay) for your own CSS, plus
 * a preset (`data-enter`, `data-leave`) and `--os-transition-duration`. Under
 * reduced motion the duration is 0 and callbacks still fire.
 */
export function Transition({ show, unmountOnExit, enter = 'fade', leave = enter, children, ...options }: TransitionProps) {
  const { state, mounted, duration } = useTransition(show, options);
  const node = useRef<HTMLElement | null>(null);
  const childRef = isValidElement(children) ? (children.props as { ref?: Ref<HTMLElement> }).ref : undefined;
  const ref = useMergedRefs(node, childRef);

  // `collapse` animates height, which needs the content's measured size.
  useLayoutEffect(() => {
    const el = node.current;
    const opening = state === 'opening' && enter === 'collapse';
    const closing = state === 'closing' && leave === 'collapse';
    if (!el) return;
    if (!opening && !closing) {
      el.style.removeProperty('height');
      return;
    }
    const full = `${el.scrollHeight}px`;
    el.style.height = opening ? '0px' : full;
    void el.offsetHeight; // commit the start height before animating
    el.style.height = opening ? full : '0px';
  }, [state, enter, leave]);

  if (!isValidElement(children) || (unmountOnExit && !mounted)) return null;
  const props = children.props as { className?: string; style?: CSSProperties; hidden?: boolean };
  const custom = state === 'opening' && !isPreset(enter) ? enter : state === 'closing' && !isPreset(leave) ? leave : undefined;

  return cloneElement(children, {
    ref,
    className: cx(cls('transition'), props.className, custom),
    'data-state': state,
    'data-enter': isPreset(enter) ? enter : undefined,
    'data-leave': isPreset(leave) ? leave : undefined,
    style: { ...props.style, '--os-transition-duration': `${duration}ms` } as CSSProperties,
    hidden: state === 'closed' ? true : props.hidden,
  });
}
