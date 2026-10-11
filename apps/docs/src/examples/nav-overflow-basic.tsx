import { useState } from 'react';
import { Nav, NavItem } from 'onesmallui';

const sections = ['Overview', 'Telemetry', 'Navigation', 'Propulsion', 'Life support', 'Communications', 'Cargo', 'Medical', 'Armory'];

// Resize the window: items that don't fit move into the "More" menu.
// The active item always stays visible.
export default function Example() {
  const [active, setActive] = useState('Cargo');
  return (
    <div className="os-grid os-gap-6">
      {(['tabs', 'underline'] as const).map((variant) => (
        <Nav key={variant} overflow variant={variant} aria-label={`Ship sections (${variant})`}>
          {sections.map((s) => (
            <NavItem key={s} active={s === active} onClick={() => setActive(s)}>
              {s}
            </NavItem>
          ))}
        </Nav>
      ))}
    </div>
  );
}
