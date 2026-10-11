import { useState } from 'react';
import { Button, Drawer, Nav, NavItem } from 'onesmallui';

// From lg up the content renders inline as a sidebar; below lg it becomes a drawer.
export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <div className="os-flex os-flex-col os-gap-3">
      <div className="lg:os-hidden">
        <Button variant="outline" onClick={() => setOpen(true)}>
          Show filters
        </Button>
      </div>
      <Drawer open={open} onClose={() => setOpen(false)} inlineFrom="lg" placement="start" title="Filters">
        <Nav aria-label="Sectors" orientation="vertical" variant="pills">
          <NavItem href="#components/drawer" active>
            All sectors
          </NavItem>
          <NavItem href="#components/drawer">Inner rim</NavItem>
          <NavItem href="#components/drawer">Outer rim</NavItem>
        </Nav>
      </Drawer>
    </div>
  );
}
