import { Button, Input, Nav, NavItem, Navbar, NavbarText } from 'onesmallui';

const here = '#components/navbar';

// Below lg the links, search and text move into a drawer behind the toggle.
export default function Example() {
  return (
    <Navbar brand="Starlight" brandHref={here} aria-label="Example site">
      <Nav as="div" overflow>
        <NavItem href={here} active>
          Home
        </NavItem>
        <NavItem href={here}>Fleet</NavItem>
        <NavItem href={here}>Missions</NavItem>
      </Nav>
      <form role="search" className="os-flex os-gap-2" onSubmit={(e) => e.preventDefault()}>
        <Input type="search" aria-label="Search the fleet" placeholder="Search" size="sm" />
        <Button type="submit" size="sm" variant="outline">
          Go
        </Button>
      </form>
      <NavbarText>Signed in as Vega</NavbarText>
    </Navbar>
  );
}
