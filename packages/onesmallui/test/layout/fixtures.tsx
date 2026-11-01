import type { ComponentType, CSSProperties } from 'react';
import {
  Avatar,
  Combobox,
  DatePicker,
  Menu,
  MenuContent,
  MenuTrigger,
  Popover,
  TimePicker,
  Tooltip,
  AvatarGroup,
  CommandPalette,
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  DataTable,
  Lightbox,
  MenuCheckboxItem,
  MenuDivider,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  Rating,
  Popconfirm,
  Sidebar,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarProvider,
  SidebarSection,
  SidebarToggle,
  Timeline,
  TimelineItem,
  TreeView,
  type AvatarSize,
  type CommandItem,
  type LightboxImage,
} from '../../src';
import { HomeIcon, SettingsIcon, UserIcon } from '../../src/icons';

// Solid-color SVGs with explicit intrinsic sizes: the aspect ratios that used to stretch avatars.
const svg = (w: number, h: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#3b6"/></svg>`,
  )}`;

export const avatarImages = {
  portrait: svg(300, 800),
  landscape: svg(800, 300),
  square: svg(400, 400),
  // Never resolves, so the avatar must fall back to initials.
  broken: '/does-not-exist.png',
};

export const avatarSizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
export const avatarShapes = ['circle', 'square'] as const;

function AvatarFixture() {
  return (
    <div style={{ display: 'grid', gap: 16, padding: 16 }}>
      {avatarShapes.map((shape) =>
        avatarSizes.map((size) => (
          <div key={`${shape}-${size}`} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {Object.entries(avatarImages).map(([kind, src]) => (
              <Avatar
                key={kind}
                name="Ada Lovelace"
                src={src}
                size={size}
                shape={shape}
                status="online"
                data-test={`single ${shape} ${size} ${kind}`}
              />
            ))}
            <AvatarGroup label="Crew" size={size} total={6} data-test={`group ${shape} ${size}`}>
              {Object.entries(avatarImages).map(([kind, src]) => (
                <Avatar key={kind} name="Grace Hopper" src={src} shape={shape} data-test={`grouped ${shape} ${size} ${kind}`} />
              ))}
            </AvatarGroup>
          </div>
        )),
      )}
    </div>
  );
}

const crew = Array.from({ length: 40 }, (_, i) => ({
  id: String(i),
  name: `Crew member ${i + 1}`,
  role: ['Pilot', 'Engineer', 'Medic', 'Navigator'][i % 4]!,
  notes: 'A long note that makes the table wider than its scroll region. '.repeat(3),
}));

function DataTableFixture() {
  return (
    <div style={{ padding: 16, inlineSize: 600 }}>
      <DataTable
        caption="Crew"
        data={crew}
        columns={[
          { key: 'name', header: 'Name', sortable: true },
          { key: 'role', header: 'Role' },
          { key: 'notes', header: 'Notes', cell: (row) => <span style={{ whiteSpace: 'nowrap' }}>{row.notes}</span> },
        ]}
        selectable
        stickyHeader
        maxHeight="16rem"
        data-test="data-table"
      />
    </div>
  );
}

// Enough items to scroll, with descriptions, shortcuts and a label long enough to wrap.
const commands: CommandItem[] = Array.from({ length: 30 }, (_, i) => ({
  id: `cmd-${i}`,
  label: i === 3 ? 'A deliberately long command label that has to wrap on a narrow phone screen' : `Command number ${i + 1}`,
  description: i % 3 === 0 ? 'Runs a thing, with a description underneath the label' : undefined,
  shortcut: i % 4 === 0 ? 'Mod+Shift+K' : undefined,
  group: ['Actions', 'Navigation', 'Settings'][i % 3],
}));

function CommandPaletteFixture() {
  return (
    <div style={{ padding: 16 }}>
      <p>Page content behind the palette.</p>
      <CommandPalette defaultOpen items={commands} hotkey={false} data-test="command-palette" />
    </div>
  );
}

// Empty states. A fragment renders as it is, which is exactly the 0.4.0 markup (bare text in the
// cell), so the runner compares the EmptyState versions against it: same size, spacing, color, alignment.
const emptyColumns = [
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
];

function EmptyStatesFixture() {
  return (
    <div style={{ padding: 16, inlineSize: 600, display: 'grid', gap: 24 }}>
      <DataTable caption="Default" data={[]} columns={emptyColumns} data-test="dt-default" />
      <DataTable caption="Reference" data={[]} columns={emptyColumns} emptyState={<>No results</>} data-test="dt-reference" />
      <DataTable caption="String" data={[]} columns={emptyColumns} emptyState="No crew yet" data-test="dt-string" />
      <DataTable caption="String reference" data={[]} columns={emptyColumns} emptyState={<>No crew yet</>} data-test="dt-string-reference" />
      <div style={{ inlineSize: 320 }}>
        <TreeView aria-label="Files" items={[]} emptyState="No files" data-test="tree" />
      </div>
    </div>
  );
}

// The palette with nothing to show: `?state=error` makes the loader fail, `?state=reference`
// renders the 0.4.0 markup (bare text) through a fragment.
function CommandPaletteEmptyFixture() {
  const state = new URLSearchParams(location.search).get('state');
  return (
    <CommandPalette
      defaultOpen
      hotkey={false}
      items={commands}
      defaultQuery="zzzz"
      emptyState={state === 'reference' ? (q) => <>{`No results for “${q}”`}</> : undefined}
      loadItems={state === 'error' ? () => Promise.reject(new Error('offline')) : undefined}
      debounce={0}
      data-test="command-palette"
    />
  );
}

// A target that fills the viewport, so the runner can right-click at every corner and edge.
function ContextMenuFixture() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div role="region" tabIndex={0} aria-label="Canvas" data-test="context-target" style={{ position: 'fixed', inset: 0 }}>
          Right-click anywhere
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent aria-label="Canvas actions" data-test="context-menu">
        <MenuItem shortcut="Ctrl+X">Cut</MenuItem>
        <MenuItem shortcut="Ctrl+C">Copy</MenuItem>
        <MenuItem shortcut="Ctrl+V">Paste</MenuItem>
        <MenuItem disabled>Paste as plain text</MenuItem>
        <MenuDivider />
        <MenuCheckboxItem defaultChecked>Snap to grid</MenuCheckboxItem>
        <MenuRadioGroup label="Zoom" defaultValue="100">
          <MenuRadioItem value="50">50%</MenuRadioItem>
          <MenuRadioItem value="100">100%</MenuRadioItem>
          <MenuRadioItem value="200">200%</MenuRadioItem>
        </MenuRadioGroup>
        <MenuSub label="Arrange">
          <MenuItem>Bring to front</MenuItem>
          <MenuItem>Send to back</MenuItem>
        </MenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}

// One trigger pinned to each corner and edge (and the center), so the runner can open each and
// check the panel flips and shifts to stay inside the viewport.
const edgeSpots: Record<string, CSSProperties> = {
  'top-left': { insetBlockStart: 4, insetInlineStart: 4 },
  top: { insetBlockStart: 4, insetInlineStart: '50%', transform: 'translateX(-50%)' },
  'top-right': { insetBlockStart: 4, insetInlineEnd: 4 },
  right: { insetBlockStart: '50%', insetInlineEnd: 4, transform: 'translateY(-50%)' },
  'bottom-right': { insetBlockEnd: 4, insetInlineEnd: 4 },
  bottom: { insetBlockEnd: 4, insetInlineStart: '50%', transform: 'translateX(-50%)' },
  'bottom-left': { insetBlockEnd: 4, insetInlineStart: 4 },
  left: { insetBlockStart: '50%', insetInlineStart: 4, transform: 'translateY(-50%)' },
  center: { insetBlockStart: '50%', insetInlineStart: '50%', transform: 'translate(-50%, -50%)' },
};

function PopconfirmFixture() {
  return (
    <>
      <p data-test="popconfirm-outside" style={{ position: 'fixed', insetBlockStart: '30%', insetInlineStart: 16, margin: 0 }}>
        Plain text
      </p>
      <button type="button" data-test="popconfirm-other" style={{ position: 'fixed', insetBlockStart: '70%', insetInlineStart: 16 }}>
        Other control
      </button>
      {Object.entries(edgeSpots).map(([name, spot], i) => (
        <span key={name} style={{ position: 'fixed', ...spot }}>
          <Popconfirm
            title="Remove this crew member from the mission?"
            message="They lose access to the mission board and its files. You can invite them again later."
            variant={i % 2 ? 'danger' : 'default'}
            confirmLabel="Remove"
            className={`layout-popconfirm-${name}`}
          >
            <button type="button" data-test={`popconfirm-${name}`}>
              {name}
            </button>
          </Popconfirm>
        </span>
      ))}
    </>
  );
}

// App shell: `?collapsed=1` starts as a rail, `?dir=rtl` mirrors it. Below lg it is a drawer.
function SidebarFixture() {
  const params = new URLSearchParams(location.search);
  return (
    <div dir={params.get('dir') ?? 'ltr'} style={{ display: 'flex', blockSize: '100vh' }}>
      <SidebarProvider defaultCollapsed={params.get('collapsed') === '1'}>
        <Sidebar aria-label="App">
          <SidebarHeader>
            <span className="os-sidebar__label">Starlight</span>
            <SidebarToggle data-test="inner-toggle" />
          </SidebarHeader>
          <SidebarSection heading="Workspace">
            <SidebarItem href="#home" icon={<HomeIcon />} active data-test="first-item">
              Dashboard
            </SidebarItem>
            <SidebarItem href="#crew" icon={<UserIcon />} badge="3">
              Crew
            </SidebarItem>
            <SidebarGroup label="Settings" icon={<SettingsIcon />}>
              <SidebarItem href="#profile">Profile</SidebarItem>
            </SidebarGroup>
          </SidebarSection>
        </Sidebar>
        <div style={{ flex: 1, padding: 16 }}>
          <SidebarToggle data-test="outer-toggle" />
          <p>Content</p>
        </div>
      </SidebarProvider>
    </div>
  );
}

// Half-step ratings in both directions: the half fill and the half hit area sit at the inline start.
function RatingFixture() {
  return (
    <div style={{ display: 'grid', gap: 24, padding: 16 }}>
      {(['ltr', 'rtl'] as const).map((dir) => (
        <div key={dir} dir={dir} style={{ display: 'grid', gap: 12 }}>
          <Rating label={`Half steps ${dir}`} precision={0.5} defaultValue={2.5} data-test={`rating-${dir}`} />
          <Rating label={`Whole steps ${dir}`} size="sm" defaultValue={3} data-test={`rating-whole-${dir}`} />
          <Rating readOnly value={2.5} precision={0.5} size="lg" data-test={`rating-readonly-${dir}`} />
        </div>
      ))}
    </div>
  );
}

// `?layout=horizontal|alternating` and `?dir=rtl`. Long enough to scroll sideways at 360px.
function TimelineFixture() {
  const params = new URLSearchParams(location.search);
  const layout = (params.get('layout') ?? 'vertical') as 'vertical' | 'alternating' | 'horizontal';
  return (
    <div dir={params.get('dir') ?? 'ltr'} style={{ padding: 16 }}>
      <Timeline layout={layout} aria-label="Mission" locale="en-US" timeZone="UTC" data-test="timeline">
        {['Launch', 'Orbit insertion', 'Docking', 'Crew transfer', 'Undocking', 'Splashdown'].map((title, i) => (
          <TimelineItem
            key={title}
            title={title}
            status={i < 3 ? 'success' : i === 3 ? 'pending' : 'default'}
            time={`2026-10-0${i + 1}T06:40:00Z`}
            description="A description long enough to wrap onto a second line in a narrow column."
          />
        ))}
      </Timeline>
    </div>
  );
}

// Striped SVG "photos" with intrinsic sizes (landscape and portrait), opened at the middle image.
// `?dir=rtl` mirrors it. The last image never loads, for the broken state.
const photo = (w: number, h: number, hue: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="hsl(${hue} 60% 40%)"/><path d="M0 0L${w} ${h}M${w} 0L0 ${h}" stroke="white" stroke-width="8"/></svg>`,
  )}`;
const lightboxImages: LightboxImage[] = [
  { src: photo(1200, 800, 10), alt: 'Red landscape', width: 1200, height: 800, caption: 'A caption long enough to wrap onto a second line on a narrow phone screen.' },
  { src: photo(800, 1200, 90), alt: 'Green portrait', width: 800, height: 1200 },
  { src: photo(1600, 900, 200), alt: 'Blue panorama', width: 1600, height: 900, caption: 'The middle image.', download: true },
  { src: photo(1000, 1000, 280), alt: 'Purple square', width: 1000, height: 1000 },
  { src: '/does-not-exist.jpg', alt: 'A photo that never loads' },
];

function LightboxFixture() {
  const params = new URLSearchParams(location.search);
  return (
    <div dir={params.get('dir') ?? 'ltr'}>
      <p>Page content behind the viewer.</p>
      <Lightbox images={lightboxImages} defaultOpen defaultIndex={2} thumbnails data-test="lightbox" />
    </div>
  );
}

// Floating panels opened from a trigger in the middle of a short viewport, where neither side has room
// for the whole panel. `?spot=top|center|bottom` moves the triggers; each panel must stay on screen.
const manyOptions = Array.from({ length: 30 }, (_, i) => ({ value: `opt-${i + 1}`, label: `Option ${i + 1}` }));
function ShortViewportFixture() {
  const spot = new URLSearchParams(location.search).get('spot') ?? 'center';
  const block: CSSProperties =
    spot === 'top' ? { insetBlockStart: 8 } : spot === 'bottom' ? { insetBlockEnd: 8 } : { insetBlockStart: '45%' };
  return (
    <div style={{ position: 'fixed', ...block, insetInlineStart: 8, insetInlineEnd: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <Menu>
        <MenuTrigger>
          <button type="button" data-test="sv-menu-trigger">Menu</button>
        </MenuTrigger>
        <MenuContent aria-label="Many actions">
          {Array.from({ length: 20 }, (_, i) => (
            <MenuItem key={i}>Action {i + 1}</MenuItem>
          ))}
        </MenuContent>
      </Menu>
      <Popover
        title="Long popover"
        content={<p data-test="sv-popover-end">{'Mission notes. '.repeat(60)}</p>}
        
      >
        <button type="button" data-test="sv-popover-trigger">Popover</button>
      </Popover>
      <Tooltip content={'Tooltip text that wraps over several lines. '.repeat(6)}>
        <button type="button" data-test="sv-tooltip-trigger">Tooltip</button>
      </Tooltip>
      <span style={{ inlineSize: 160 }} data-test="sv-combobox">
        <Combobox options={manyOptions} aria-label="Many options" />
      </span>
      <span style={{ inlineSize: 160 }} data-test="sv-timepicker">
        <TimePicker aria-label="Time" step={15} />
      </span>
      <span style={{ inlineSize: 180 }} data-test="sv-datepicker">
        <DatePicker aria-label="Date" trigger="button" />
      </span>
    </div>
  );
}

export const fixtures: Record<string, ComponentType> = {
  'short-viewport': ShortViewportFixture,
  'context-menu': ContextMenuFixture,
  avatar: AvatarFixture,
  'command-palette': CommandPaletteFixture,
  'command-palette-empty': CommandPaletteEmptyFixture,
  'data-table': DataTableFixture,
  rating: RatingFixture,
  popconfirm: PopconfirmFixture,
  lightbox: LightboxFixture,
  'empty-states': EmptyStatesFixture,
  sidebar: SidebarFixture,
  timeline: TimelineFixture,
};
