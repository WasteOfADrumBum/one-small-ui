// @vitest-environment node
// Server rendering: no window or document during render or at module scope.
import { useRef } from 'react';
import { renderToString } from 'react-dom/server';
import {
  AnnouncerProvider,
  Collapse,
  Dialog,
  LiveRegion,
  Portal,
  SkipLink,
  ToastProvider,
  Transition,
  useAnnouncer,
  useFocusReturn,
  useFocusTrap,
  useReducedMotion,
  useScrollLock,
  useTransition,
} from '../src';
import { CheckIcon } from '../src/icons';

function Hooks() {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref);
  useFocusReturn({ active: true });
  useScrollLock(true);
  const reduced = useReducedMotion();
  const { state } = useTransition(true);
  useAnnouncer();
  return (
    <div ref={ref}>
      {`${reduced} ${state}`}
    </div>
  );
}

describe('SSR', () => {
  it('renders every new hook and component on the server', () => {
    expect(typeof document).toBe('undefined');
    const html = renderToString(
      <AnnouncerProvider>
        <ToastProvider>
          <SkipLink href="#main" />
          <Hooks />
          <Portal>
            <p>portalled</p>
          </Portal>
          <Transition show>
            <div>shown</div>
          </Transition>
          <Collapse open>Body</Collapse>
          <Dialog open={false} onClose={() => {}} title="Hi" />
          <LiveRegion>status</LiveRegion>
          <CheckIcon label="Done" />
        </ToastProvider>
      </AnnouncerProvider>,
    );
    expect(html).toContain('false open');
    expect(html).toContain('data-state="open"');
    expect(html).not.toContain('portalled');
    expect(html).toContain('role="img"');
  });
});
