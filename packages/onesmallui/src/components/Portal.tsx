import { useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  children?: ReactNode;
  /** Where to render. Defaults to `document.body`. */
  container?: Element | DocumentFragment | null;
}

const subscribe = () => () => {};

/**
 * Renders its children into another part of the DOM (`document.body` by default),
 * keeping React context and events. Renders nothing on the server and during
 * hydration, so it's SSR safe.
 */
export function Portal({ children, container }: PortalProps) {
  const client = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  if (!client) return null;
  return createPortal(children, container ?? document.body);
}
