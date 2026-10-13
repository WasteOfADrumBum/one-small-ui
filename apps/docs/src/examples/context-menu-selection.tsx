import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Kbd,
  MenuCheckboxItem,
  MenuDivider,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  useHotkeys,
} from '@onesmall/ui';
import { useRef, useState } from 'react';

export default function Example() {
  const canvas = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState(true);
  const [zoom, setZoom] = useState('100');
  const [layer, setLayer] = useState('Middle');
  // The same action has a keyboard shortcut, shown in the menu and on the page.
  useHotkeys('G', () => setGrid((g) => !g), { target: canvas });

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={canvas}
          role="region"
          aria-label="Star chart"
          tabIndex={0}
          className="os-grid os-gap-2 os-p-6 os-rounded-lg os-border os-bg-surface-2 os-text-center"
        >
          <strong>Star chart</strong>
          <span className="os-text-sm os-text-muted">
            Grid {grid ? 'on' : 'off'} · Zoom {zoom}% · Layer {layer}
          </span>
          <span className="os-text-sm">
            Right-click, long press, or focus and press <Kbd combo="Shift+F10" />. Toggle the grid with <Kbd>G</Kbd>.
          </span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent aria-label="Star chart options">
        <MenuCheckboxItem checked={grid} onCheckedChange={setGrid} shortcut="G">
          Show grid
        </MenuCheckboxItem>
        <MenuRadioGroup label="Zoom" value={zoom} onValueChange={setZoom}>
          <MenuRadioItem value="50">50%</MenuRadioItem>
          <MenuRadioItem value="100">100%</MenuRadioItem>
          <MenuRadioItem value="200">200%</MenuRadioItem>
        </MenuRadioGroup>
        <MenuDivider />
        <MenuSub label="Move to layer">
          {['Front', 'Middle', 'Back'].map((l) => (
            <MenuItem key={l} active={l === layer} onSelect={() => setLayer(l)}>
              {l}
            </MenuItem>
          ))}
        </MenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}
