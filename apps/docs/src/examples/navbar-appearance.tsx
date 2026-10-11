import { Nav, NavItem, Navbar } from 'onesmallui';

const here = '#components/navbar';
const Logo = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="3" />
    <circle cx="16" cy="16" r="4" fill="currentColor" />
  </svg>
);
const links = (
  <Nav as="div">
    <NavItem href={here} active>
      Home
    </NavItem>
    <NavItem href={here}>Docs</NavItem>
  </Nav>
);

export default function Example() {
  return (
    <div className="os-grid os-gap-4">
      <Navbar appearance="dark" expand="sm" brand={<><Logo /> Dark</>} brandHref={here} aria-label="Dark example">
        {links}
      </Navbar>
      <Navbar color="primary" expand="sm" brand="Themed" brandHref={here} aria-label="Themed example">
        {links}
      </Navbar>
      <Navbar appearance="translucent" expand="sm" brand="Translucent" brandHref={here} aria-label="Translucent example">
        {links}
      </Navbar>
      <Navbar expand="never" brand="Always collapsed" brandHref={here} aria-label="Collapsed example" drawerPlacement="start">
        {links}
      </Navbar>
    </div>
  );
}
