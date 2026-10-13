import type { ComponentType } from 'react';
import {
  Avatar,
  AvatarGroup,
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  DataTable,
  MenuCheckboxItem,
  MenuDivider,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  type AvatarSize,
} from '../../src';

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

export const fixtures: Record<string, ComponentType> = {
  'context-menu': ContextMenuFixture,
  avatar: AvatarFixture,
  'data-table': DataTableFixture,
};
