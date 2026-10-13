import { useState } from 'react';
import { Button, CommandPalette, UserIcon, type CommandGroup } from '@onesmall/ui';

const people = ['Ada Lovelace', 'Grace Hopper', 'Katherine Johnson', 'Mae Jemison', 'Margaret Hamilton', 'Sally Ride'];

// Stands in for a fetch. Pass the signal on (fetch(url, { signal })) so stale requests are cancelled.
function searchPeople(query: string, { signal }: { signal: AbortSignal }): Promise<CommandGroup[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      const items = people
        .filter((name) => name.toLowerCase().includes(q))
        .map((name) => ({ id: name, label: name, icon: <UserIcon />, description: 'Crew member' }));
      resolve([{ heading: 'People', items }]);
    }, 600);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Find a person
      </Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        hotkey={false}
        label="Find a person"
        placeholder="Search people…"
        // The server already filtered, so don't filter again here.
        filter={false}
        loadItems={searchPeople}
        debounce={250}
        emptyState={(q) => (q ? `Nobody called “${q}”` : 'Start typing a name')}
      />
    </>
  );
}
