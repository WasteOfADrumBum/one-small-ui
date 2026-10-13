import { useState } from 'react';
import { Button, CommandPalette, SettingsIcon, StarIcon, type CommandGroup } from '@onesmall/ui';

export default function Example() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState('nothing yet');

  const groups: CommandGroup[] = [
    {
      heading: 'Actions',
      items: [
        { id: 'star', label: 'Star this page', icon: <StarIcon />, shortcut: 'Mod+D', onSelect: () => setLast('Starred') },
        {
          id: 'theme',
          label: 'Change theme',
          icon: <SettingsIcon />,
          placeholder: 'Pick a theme…',
          children: [
            { id: 'light', label: 'Light', onSelect: () => setLast('Light theme') },
            { id: 'dark', label: 'Dark', onSelect: () => setLast('Dark theme') },
            { id: 'system', label: 'Match the system', keywords: ['auto'], onSelect: () => setLast('System theme') },
          ],
        },
        { id: 'export', label: 'Export as PDF', description: 'Available on paid plans', disabled: true },
      ],
    },
    {
      heading: 'Go to',
      items: [
        { id: 'dialog', label: 'Dialog docs', keywords: ['modal'], href: '#components/dialog' },
        { id: 'combobox', label: 'Combobox docs', keywords: ['autocomplete', 'select'], href: '#components/combobox' },
      ],
    },
  ];

  return (
    <div className="os-flex os-flex-wrap os-items-center os-gap-3">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open command palette
      </Button>
      <p>
        Last action: <strong>{last}</strong>. Try typing <code>chth</code>.
      </p>
      {/* This site already uses Mod+K for its own search, so this example opens from the button only. */}
      <CommandPalette open={open} onOpenChange={setOpen} groups={groups} hotkey={false} />
    </div>
  );
}
