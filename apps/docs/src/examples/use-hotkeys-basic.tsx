import { useState } from 'react';
import { Kbd, useHotkeys } from '@onesmall/ui';

export default function Example() {
  const [launches, setLaunches] = useState(0);
  useHotkeys('Mod+J', () => setLaunches((n) => n + 1));

  return (
    <p>
      Press <Kbd combo="Mod+J" /> to log a launch. Launches logged: <output>{launches}</output>
    </p>
  );
}
