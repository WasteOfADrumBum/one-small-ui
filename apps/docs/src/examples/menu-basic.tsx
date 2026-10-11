import { Button, Menu, MenuContent, MenuDivider, MenuItem, MenuTrigger, useToast } from 'onesmallui';

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function Example() {
  const { toast } = useToast();
  const say = (title: string) => () => toast({ title, duration: 3000 });
  return (
    <Menu>
      <MenuTrigger>
        <Button variant="outline">Ship actions</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem icon={<Icon d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />} shortcut="⌘R" onSelect={say('Renaming')}>
          Rename
        </MenuItem>
        <MenuItem
          icon={<Icon d="M8 8h12v12H8zM4 16V4h12" />}
          description="Copies crew, cargo and route"
          onSelect={say('Duplicated')}
        >
          Duplicate
        </MenuItem>
        <MenuItem href="#components/menu" active icon={<Icon d="M3 12h18M12 3l9 9-9 9" />}>
          Current route (link)
        </MenuItem>
        <MenuItem disabled icon={<Icon d="M12 2v20M2 12h20" />}>
          Hyperjump (offline)
        </MenuItem>
        <MenuDivider />
        <MenuItem icon={<Icon d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" />} onSelect={say('Decommissioned')}>
          Decommission
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
