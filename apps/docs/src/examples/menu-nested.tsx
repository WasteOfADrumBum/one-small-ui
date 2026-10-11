import { Button, Menu, MenuContent, MenuItem, MenuSub, MenuTrigger } from 'onesmallui';

const sectors = Array.from({ length: 24 }, (_, i) => `Sector ${i + 1}`);

export default function Example() {
  return (
    <div className="os-flex os-flex-wrap os-gap-3">
      <Menu>
        <MenuTrigger>
          <Button variant="outline">Navigate</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem>Home base</MenuItem>
          <MenuSub label="Inner planets">
            <MenuItem>Mercury</MenuItem>
            <MenuItem>Venus</MenuItem>
            <MenuSub label="Earth">
              <MenuItem>Moon base</MenuItem>
              <MenuItem>Orbital station</MenuItem>
            </MenuSub>
            <MenuItem>Mars</MenuItem>
          </MenuSub>
          <MenuSub label="Outer planets" description="Long-range only">
            <MenuItem>Jupiter</MenuItem>
            <MenuItem>Saturn</MenuItem>
          </MenuSub>
        </MenuContent>
      </Menu>

      {/* Scrollable: cap the height; typeahead jumps to "Sector 2…" as you type. */}
      <Menu>
        <MenuTrigger>
          <Button variant="outline">Scrollable</Button>
        </MenuTrigger>
        <MenuContent maxHeight="16rem">
          {sectors.map((s) => (
            <MenuItem key={s}>{s}</MenuItem>
          ))}
        </MenuContent>
      </Menu>
    </div>
  );
}
