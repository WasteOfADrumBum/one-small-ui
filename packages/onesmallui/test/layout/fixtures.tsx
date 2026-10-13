import type { ComponentType } from 'react';
import { Avatar, AvatarGroup, CommandPalette, DataTable, type AvatarSize, type CommandItem } from '../../src';

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

export const fixtures: Record<string, ComponentType> = {
  avatar: AvatarFixture,
  'command-palette': CommandPaletteFixture,
  'data-table': DataTableFixture,
};
