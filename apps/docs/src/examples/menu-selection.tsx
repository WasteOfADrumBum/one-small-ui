import { useState } from 'react';
import {
  Button,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuDivider,
  MenuGroup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from 'onesmallui';

export default function Example() {
  const [grid, setGrid] = useState(true);
  const [labels, setLabels] = useState(false);
  const [sort, setSort] = useState('name');
  return (
    <div className="os-flex os-items-center os-gap-4 os-flex-wrap">
      <Menu>
        <MenuTrigger>
          <Button variant="outline">View options</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuGroup label="Display">
            <MenuCheckboxItem checked={grid} onCheckedChange={setGrid}>
              Show grid
            </MenuCheckboxItem>
            <MenuCheckboxItem checked={labels} onCheckedChange={setLabels}>
              Show labels
            </MenuCheckboxItem>
          </MenuGroup>
          <MenuDivider />
          <MenuRadioGroup label="Sort by" value={sort} onValueChange={setSort}>
            <MenuRadioItem value="name">Name</MenuRadioItem>
            <MenuRadioItem value="distance" description="Nearest first">
              Distance
            </MenuRadioItem>
            <MenuRadioItem value="fuel">Fuel</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
      <p className="os-text-sm os-text-muted" aria-live="polite">
        Grid {grid ? 'on' : 'off'}, labels {labels ? 'on' : 'off'}, sorted by {sort}.
      </p>
    </div>
  );
}
