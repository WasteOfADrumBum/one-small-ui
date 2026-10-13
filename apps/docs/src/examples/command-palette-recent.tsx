import { useState } from 'react';
import { Button, CommandPalette, type CommandItem } from '@onesmall/ui';

const files: CommandItem[] = ['README.md', 'package.json', 'src/index.ts', 'src/App.tsx', 'vite.config.ts', 'tsconfig.json'].map(
  (path) => ({ id: path, label: path, group: 'Files' }),
);

export default function Example() {
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState<string>();
  return (
    <div className="os-flex os-flex-wrap os-items-center os-gap-3">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open a file
      </Button>
      <p>{opened ? `Opened ${opened}` : 'Choose a file, then open the palette again.'}</p>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        hotkey={false}
        items={files}
        placeholder="Go to file…"
        recent={{ storageKey: 'docs-example-recent-files', max: 3 }}
        onSelect={(item) => setOpened(item.label)}
      />
    </div>
  );
}
