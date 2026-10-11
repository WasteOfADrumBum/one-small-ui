import { Nav, NavItem } from 'onesmallui';

const here = '#components/nav';

export default function Example() {
  return (
    <div className="os-grid os-gap-6">
      {(['links', 'tabs', 'pills', 'underline'] as const).map((variant) => (
        <Nav key={variant} variant={variant} aria-label={`Example ${variant} navigation`}>
          <NavItem href={here} active>
            Overview
          </NavItem>
          <NavItem href={here}>Fleet</NavItem>
          <NavItem href={here}>Crew</NavItem>
          <NavItem disabled>Archives</NavItem>
        </Nav>
      ))}
    </div>
  );
}
