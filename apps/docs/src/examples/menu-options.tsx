import { Button, Menu, MenuContent, MenuItem, MenuTrigger, type MenuAutoClose } from 'onesmallui';

const autoCloses: { label: string; value: MenuAutoClose }[] = [
  { label: 'Default (true)', value: true },
  { label: "'inside'", value: 'inside' },
  { label: "'outside'", value: 'outside' },
  { label: 'false', value: false },
];

export default function Example() {
  return (
    <div className="os-grid os-gap-4">
      <div className="os-flex os-flex-wrap os-gap-3">
        {autoCloses.map(({ label, value }) => (
          <Menu key={label} autoClose={value}>
            <MenuTrigger>
              <Button variant="outline" size="sm">
                autoClose {label}
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem>Scan</MenuItem>
              <MenuItem>Hail</MenuItem>
            </MenuContent>
          </Menu>
        ))}
      </div>
      <div className="os-flex os-flex-wrap os-gap-3">
        {/* Responsive placement: below md open underneath, from md up open to the right. */}
        <Menu placement={{ base: 'bottom-start', md: 'right-start' }}>
          <MenuTrigger>
            <Button variant="soft">Responsive placement</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Port</MenuItem>
            <MenuItem>Starboard</MenuItem>
          </MenuContent>
        </Menu>
        <Menu appearance="dark" placement="top-start">
          <MenuTrigger>
            <Button variant="soft" color="inverse">
              Dark, opens up
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Night mode</MenuItem>
            <MenuItem>Silent running</MenuItem>
          </MenuContent>
        </Menu>
        <Menu appearance="translucent">
          <MenuTrigger>
            <Button variant="soft" color="accent">
              Translucent
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Glass deck</MenuItem>
            <MenuItem>Observation</MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  );
}
