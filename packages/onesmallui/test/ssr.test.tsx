// @vitest-environment node
// Server rendering: no window or document during render or at module scope.
import { useRef } from 'react';
import { renderToString } from 'react-dom/server';
import {
  AnnouncerProvider,
  Collapse,
  CommandPalette,
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  DataTable,
  Dialog,
  Field,
  Kbd,
  MenuItem,
  NumberInput,
  Rating,
  Popconfirm,
  TagInput,
  Timeline,
  TimelineItem,
  TimePicker,
  LiveRegion,
  Portal,
  Sidebar,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
  SidebarToggle,
  SkipLink,
  ToastProvider,
  Transition,
  TreeView,
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
  it('renders CommandPalette on the server, open and closed, with recent and async options', () => {
    const groups = [{ heading: 'Pages', items: [{ id: 'home', label: 'Home', href: '/', shortcut: 'Mod+H' }] }];
    const html = renderToString(
      <AnnouncerProvider>
        <CommandPalette groups={groups} recent={{ storageKey: 'ssr-recent' }} />
        <CommandPalette defaultOpen defaultQuery="ho" groups={groups} loadItems={async () => []} />
      </AnnouncerProvider>,
    );
    expect(html).toContain('role="combobox"');
    expect(html).toContain('role="listbox"');
    expect(html).toContain('Control H');
    expect(html).toContain('<mark');
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

  it('renders TreeView with selection, checkboxes and lazy nodes on the server', () => {
    const items = [
      { id: 'docs', label: 'Documents', children: [{ id: 'cv', label: 'CV.pdf', href: '/cv' }] },
      { id: 'remote', label: 'Remote', hasChildren: true },
    ];
    const html = renderToString(
      <AnnouncerProvider>
        <TreeView aria-label="Files" items={items} defaultExpandedKeys={['docs']} defaultSelectedKeys={['cv']} />
        <TreeView aria-label="Checks" items={items} checkboxes defaultCheckedKeys={['cv']} loadChildren={async () => []} />
      </AnnouncerProvider>,
    );
    expect(html).toContain('role="tree"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain('href="/cv"');
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
  it('renders Sidebar inline (never the drawer) and reads no storage on the server', () => {
    const html = renderToString(
      <Sidebar aria-label="App" persistKey="app-sidebar">
        <SidebarHeader>
          <SidebarToggle />
        </SidebarHeader>
        <SidebarSection heading="Workspace">
          <SidebarItem href="/" active>
            Home
          </SidebarItem>
          <SidebarGroup label="Settings">
            <SidebarItem href="/profile">Profile</SidebarItem>
          </SidebarGroup>
        </SidebarSection>
      </Sidebar>,
    );
    expect(html).toContain('<nav');
    expect(html).toContain('data-mode="expanded"');
    expect(html).toContain('data-drawer-below="lg"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('aria-label="Collapse sidebar"');
    expect(html).not.toContain('<dialog');
  });

  it('renders Rating, interactive and read-only, on the server', () => {
    const html = renderToString(
      <AnnouncerProvider>
        <Field label="Service">
          <Rating name="service" precision={0.5} defaultValue={3.5} allowClear />
        </Field>
        <Rating readOnly value={4.5} precision={0.5} />
      </AnnouncerProvider>,
    );
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('aria-label="3.5 stars"');
    expect(html).toContain('data-fill="half"');
    expect(html).toContain('aria-label="4.5 out of 5 stars"');
  });
  it('renders Timeline with absolute dates on the server unless now is passed', () => {
    const feed = (now?: Date) => (
      <Timeline variant="feed" pageSize={1} locale="en-US" timeZone="UTC" now={now}>
        <TimelineItem actor="Ada Lovelace" action="commented" time="2026-10-16T11:55:00Z" />
        <TimelineItem actor="Grace Hopper" action="approved" time="2026-10-16T11:00:00Z" />
      </Timeline>
    );
    const html = renderToString(feed());
    expect(html).toContain('<ol');
    expect(html).toMatch(/datetime="2026-10-16T11:55:00Z"/i);
    expect(html).toContain('Friday, October 16, 2026 at 11:55 AM');
    expect(html).not.toContain('ago');
    expect(html).toContain('Show more');
    expect(renderToString(feed(new Date('2026-10-16T12:00:00Z')))).toContain('5 minutes ago');
  });

  it('renders an open Popconfirm as an alertdialog without touching the DOM', () => {
    const html = renderToString(
      <Popconfirm defaultOpen variant="danger" title="Archive this log?" message="It moves to the archive." confirmLabel="Archive">
        <button type="button">Archive</button>
      </Popconfirm>,
    );
    expect(html).toContain('role="alertdialog"');
    expect(html).toContain('aria-describedby="os-popconfirm-');
    expect(html).toContain('os-popconfirm__actions');
  });
});
