import { MenuDivider, MenuItem, Nav, NavItem, NavMenu } from 'onesmallui';

const here = '#components/nav';

export default function Example() {
  return (
    <Nav aria-label="Station" variant="tabs">
      <NavItem href={here} active>
        Dashboard
      </NavItem>
      <NavMenu label="Systems">
        <MenuItem href={here}>Life support</MenuItem>
        <MenuItem href={here}>Navigation</MenuItem>
        <MenuDivider />
        <MenuItem href={here}>All systems</MenuItem>
      </NavMenu>
      <NavItem href={here}>Logs</NavItem>
    </Nav>
  );
}
