// @vitest-environment node
// Server rendering: no window or document during render or at module scope.
import { useRef } from 'react';
import { renderToString } from 'react-dom/server';
import {
  AnnouncerProvider,
  Collapse,
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  DataTable,
  Dialog,
  Field,
  Kbd,
  MenuItem,
  NumberInput,
  TagInput,
  TimePicker,
  LiveRegion,
  Portal,
  SkipLink,
  ToastProvider,
  Transition,
  useAnnouncer,
  useFocusReturn,
  useFocusTrap,
  useHotkeys,
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

  it('renders the 0.3 form controls and DataTable on the server', () => {
    const html = renderToString(
      <AnnouncerProvider>
        <NumberInput aria-label="Tip" name="tip" locale="en-US" defaultValue={0.25} formatOptions={{ style: 'percent' }} allowWheel />
        <Field label="Tags">
          <TagInput name="tags" defaultValue={['a']} suggestions={['a', 'b']} />
        </Field>
        <TimePicker aria-label="Start" locale="en-US" defaultValue="09:30" name="start" />
        <DataTable
          caption="Crew"
          data={[{ id: 'ada', name: 'Ada' }]}
          columns={[{ key: 'name', header: 'Name', sortable: true, hideable: true, filterable: true }]}
          selectable
          searchable
          pagination
          stickyHeader
          maxHeight="20rem"
        />
        <DataTable caption="Loading crew" data={[]} columns={[{ key: 'name', header: 'Name' }]} loading />
      </AnnouncerProvider>,
    );
    expect(html).toContain('25%');
    expect(html).toContain('9:30 AM');
    expect(html).toContain('role="spinbutton"');
    expect(html).toContain('aria-busy="true"');
  });
  it('renders Kbd with the non-Apple labels and runs useHotkeys without a document', () => {
    function Shortcut() {
      useHotkeys('Mod+K', () => {});
      return <Kbd combo="Mod+K" />;
    }
    const html = renderToString(<Shortcut />);
    expect(html).toContain('data-platform="other"');
    expect(html).toContain('Control K');
  });
  it('renders an open ContextMenu without touching the DOM', () => {
    const html = renderToString(
      <ContextMenu defaultOpen>
        <ContextMenuTrigger>
          <button type="button">Cargo</button>
        </ContextMenuTrigger>
        <ContextMenuContent aria-label="Cargo actions">
          <MenuItem>Inspect</MenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(html).toContain('data-context-menu-trigger');
    expect(html).toContain('role="menu"');
    expect(html).toContain('os-context-menu');
  });
});
