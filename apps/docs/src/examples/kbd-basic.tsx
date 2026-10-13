import { Kbd } from '@onesmall/ui';

export default function Example() {
  return (
    <ul className="os-grid os-gap-2">
      <li>
        Search the docs: <Kbd combo="Mod+K" />
      </li>
      <li>
        Command palette: <Kbd combo="Mod+Shift+P" />
      </li>
      <li>
        Keyboard help: <Kbd combo="Shift+?" />
      </li>
      <li>
        Close a dialog: <Kbd>Esc</Kbd>
      </li>
    </ul>
  );
}
