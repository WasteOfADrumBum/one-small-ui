import { useState } from 'react';
import { Button, Field, Input, useAnnouncer, useCopyToClipboard } from '@onesmall/ui';
import * as Icons from '@onesmall/ui/icons';
import type { IconComponent } from '@onesmall/ui/icons';

// Every named icon: PascalCase exports ending in "Icon" (not the base Icon or createIcon).
const all = Object.entries(Icons).filter(([name]) => /^[A-Z]\w+Icon$/.test(name)) as [string, IconComponent][];

export default function Example() {
  const [query, setQuery] = useState('');
  const { copy } = useCopyToClipboard();
  const { announce } = useAnnouncer();
  const shown = all.filter(([name]) => name.toLowerCase().includes(query.trim().toLowerCase()));

  const copyImport = async (name: string) => {
    const ok = await copy(`import { ${name} } from '@onesmall/ui/icons';`);
    announce(ok ? `Copied ${name} import` : `Could not copy ${name} import`);
  };

  return (
    <div className="os-grid os-gap-4">
      <Field label="Search icons" hint={`${shown.length} of ${all.length} icons. Select one to copy its import.`}>
        <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
      </Field>
      <ul className="os-grid os-gap-2 os-list-unstyled os-mb-0" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(11rem, 1fr))' }}>
        {shown.map(([name, Glyph]) => (
          <li key={name}>
            <Button
              variant="ghost"
              color="neutral"
              fullWidth
              className="os-justify-start"
              leftIcon={<Glyph />}
              aria-label={`Copy ${name} import`}
              onClick={() => copyImport(name)}
            >
              {name}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
