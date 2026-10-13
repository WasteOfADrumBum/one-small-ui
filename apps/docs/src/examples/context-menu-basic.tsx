import {
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Menu,
  MenuContent,
  MenuDivider,
  MenuItem,
  MenuTrigger,
  MoreHorizontalIcon,
  useToast,
} from '@onesmall/ui';

const files = ['flight-plan.pdf', 'crew-roster.csv', 'fuel-log.xlsx'];

// One set of items, used by the context menu and by the visible "More actions" button.
function FileActions({ file }: { file: string }) {
  const say = useSay(file);
  return (
    <>
      <MenuItem onSelect={say('Opening')}>Open</MenuItem>
      <MenuItem onSelect={say('Renaming')}>Rename</MenuItem>
      <MenuItem onSelect={say('Duplicated')}>Duplicate</MenuItem>
      <MenuDivider />
      <MenuItem onSelect={say('Deleted')}>Delete</MenuItem>
    </>
  );
}

function useSay(file: string) {
  const { toast } = useToast();
  return (title: string) => () => toast({ title: `${title} ${file}`, duration: 3000 });
}

function FileRow({ file }: { file: string }) {
  const say = useSay(file);
  return (
    <li className="os-flex os-items-center os-gap-2">
      {/* The target is the file's own button: clicking opens it, right-click or Shift+F10 shows its actions. */}
      <ContextMenu>
        <ContextMenuTrigger>
          <Button variant="ghost" className="os-flex-1" onClick={say('Opening')}>
            {file}
          </Button>
        </ContextMenuTrigger>
        <ContextMenuContent aria-label={`Actions for ${file}`}>
          <FileActions file={file} />
        </ContextMenuContent>
      </ContextMenu>
      <Menu placement="bottom-end">
        <MenuTrigger>
          <Button size="sm" variant="ghost" aria-label={`More actions for ${file}`}>
            <MoreHorizontalIcon />
          </Button>
        </MenuTrigger>
        <MenuContent>
          <FileActions file={file} />
        </MenuContent>
      </Menu>
    </li>
  );
}

export default function Example() {
  return (
    <ul className="os-list-unstyled os-grid os-gap-1 os-mb-0">
      {files.map((file) => (
        <FileRow key={file} file={file} />
      ))}
    </ul>
  );
}
