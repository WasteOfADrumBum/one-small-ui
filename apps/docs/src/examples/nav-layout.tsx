import { Nav, NavItem } from 'onesmallui';

const here = '#components/nav';
const items = (
  <>
    <NavItem href={here} active>
      Bridge
    </NavItem>
    <NavItem href={here}>Engineering</NavItem>
    <NavItem href={here}>Medical bay</NavItem>
  </>
);

export default function Example() {
  return (
    <div className="os-grid os-gap-6">
      <Nav aria-label="Centered" align="center" variant="pills">
        {items}
      </Nav>
      <Nav aria-label="End aligned" align="end" variant="pills">
        {items}
      </Nav>
      <Nav aria-label="Filled" fill variant="tabs">
        {items}
      </Nav>
      <Nav aria-label="Justified" justified variant="underline">
        {items}
      </Nav>
      <Nav aria-label="Vertical" orientation="vertical" variant="pills" style={{ maxWidth: '16rem' }}>
        {items}
      </Nav>
    </div>
  );
}
