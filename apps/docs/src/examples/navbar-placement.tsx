import { useState } from 'react';
import { Button, Nav, NavItem, Navbar } from 'onesmallui';

const here = '#components/navbar';

// The frame uses `transform` so fixed navbars stay inside it for the demo.
export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <div className="os-grid os-gap-4">
      {/* External control: open the navbar drawer from anywhere. */}
      <div>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open the menu from outside
        </Button>
      </div>
      <div
        tabIndex={0}
        aria-label="Navbar placement demo"
        role="region"
        style={{ transform: 'translateZ(0)', height: '14rem', overflow: 'auto' }}
        className="os-rounded-lg os-bg-surface-2"
      >
        <Navbar
          placement="sticky-top"
          expand="never"
          open={open}
          onOpenChange={setOpen}
          brand="Sticky top"
          brandHref={here}
          aria-label="Sticky example"
        >
          <Nav as="div">
            <NavItem href={here} active>
              Home
            </NavItem>
            <NavItem href={here}>Fleet</NavItem>
          </Nav>
        </Navbar>
        <p className="os-p-4" style={{ height: '30rem' }}>
          Scroll this frame: the navbar sticks. The bar below is fixed to the bottom.
        </p>
        <Navbar placement="fixed-bottom" expand="always" brand="Fixed bottom" brandHref={null} aria-label="Fixed example" />
      </div>
    </div>
  );
}
